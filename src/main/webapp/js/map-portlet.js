/*  MAPS PORTLET
 *  This is all the JavaScript that controls the Google Maps Portlet.
 *  All Google methods are contained in MapPortlet.MapView.gmaps.
 *  Backbone is used for models, and views. Neither the Backbone router or JQueryMobile router is used.
 *  Underscore is a dependency of Backbone and also handles templating.
 *  Backbone Layout Manager allows for multiple Backbone Views per screen.
 */

MapPortlet= function ( $, _, Backbone, google, options ) {
  
  Backbone.LayoutManager.configure({
      manage: true
  });
  
  /* ********************************************** 
   * *** MODELS
   * **********************************************
   */
  
  /* MAP LOCATION *********************************
   * 
   */
  var MapLocation= Backbone.Model.extend({
  
    getCoords : function () {
      var lat= this.get('latitude'),
        lon= this.get('longitude');
      return lat != null && lon != null && { latitude : lat, longitude : lon }
    }
  
  });
  
  
  /* MAP LOCATIONS ********************************
   * 
   */
  var MapLocations= Backbone.Collection.extend({
    model : MapLocation,
  
    defaultLocation : {},
  
    initialize : function (options) {
      this.url= options.url;
    },
  
    parse : function (response) {
      var index= 0, categories= {};
      this.defaultLocation= response.mapData.defaultLocation;
      _.each(response.mapData.locations, function (location) {
        // add id
        location.id= index;
        index += 1;
        // group categories
        if( location.categories ) {
          _.each( location.categories, function (category) {
            if( ! categories.hasOwnProperty(category) ) categories[category]=0;
            categories[category] += 1;
          });
        }
      });
      this.categories= categories;
      return response.mapData.locations;
    },
  
    findById : function (id) {
      var id= parseInt(id, 10);
      return this.find( function (model) {
        return model.get('id') === id;
      });
    }
  
  });
  
  
  
  /* MATCHING MAP LOCATIONS ***********************
   * 
   */
  var MatchingMapLocations= Backbone.Collection.extend({
    model: MapLocation,
    defaultLocation : { latitude:1, longitude:2 },
  
    initialize : function () {
      this.on('reset', this.calculateDistances, this);
    },
  
    /* comparator()
     * Always sort by distance. 
     */
    comparator : function (model) {
      return model.get('distance');
    },
  
    calculateDistances : function () {
      var coords, dist, collection= this;
      this.models.forEach( function (model) {
        coords= model.getCoords();
        dist= coords ? collection.calculateDistance( collection.defaultLocation, model.getCoords() ) : -1;
        model.set('distance', dist );
      });
      // Resort now that location is defined. This MUST be silent, or you will cause an infinite loop.
      this.sort({silent:true});
    },
  
    calculateDistance : function (coord1, coord2) {
      var lat1 = this.convertDegToRad(coord1.latitude),
        lon1 = this.convertDegToRad(coord1.longitude),
        lat2 = this.convertDegToRad(coord2.latitude),
        lon2 = this.convertDegToRad(coord2.longitude),
  
        R = 6371, // km
        dLat = lat2-lat1,
        dLon = lon2-lon1,
        a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },
  
    convertDegToRad : function (number) {
      return number * Math.PI / 180;
    }
  
  });
  
  
  
  /* ********************************************** 
   * *** VIEWS
   * **********************************************
   */

  /* MAP VIEW *************************************
   * 
   */
  var MapView= Backbone.View.extend({
    template: '#N_map-view-template',
    className: 'portlet',

    events : {
      'click .map-link' : 'clickLocation'
    },

    initialize: function (options) {
      this.mapLocations= options.mapLocations.on('reset', this.createMap, this);
      this.mapLocations.on('reset', this.createMap, this);
      this.matchingMapLocations= options.matchingMapLocations;
      this.matchingMapLocations.on('reset', this.drawMap, this);
      this.isVisible= true;
      this.mapOptions= options.mapOptions;
    },

    /* GOOGLE MAPS API
     * The gmaps object should contain all the gmaps-specific API methods for the entire application. 
     */
    gmaps : {
      newMap : function (div, options) {
        return new window.google.maps.Map( div, options );
      },
      latLng : function (latitude, longitude) {
        return new window.google.maps.LatLng(latitude, longitude);
      },
      infoWindow : function () {
        return new window.google.maps.InfoWindow();
      },
      LatLngBounds : function () {
        return new window.google.maps.LatLngBounds();
      },
      marker : function (options) {
        return new window.google.maps.Marker(options);
      },
      addListener : function (target, event, callback) {
        window.google.maps.event.addListener(target, event, callback);
      }
    },

    createMap : function () {
      var coords;
      if( ! this.map ) {
        coords= this.mapLocations.defaultLocation;
        latLng= this.gmaps.latLng(coords.latitude, coords.longitude);
        this.mapOptions.center= latLng;
        // TODO: DON'T HARD CODE SELECTORS!
        this.map= this.gmaps.newMap( $('.map-display', this.$el).get(0), this.mapOptions );
        this.infoWindow= this.gmaps.infoWindow();
      }
      return this.map;
    },

    clearMarkers : function () {
      if( this.markers ) {
        _.each(this.markers, function (m) {
          m.setMap(null);
        });
      }
      this.markers= [];
    },

    drawMap : function () {
      var map, infoWindow, point, bounds, markers=[];
      if( ! this.isVisible ) this.$el.show();
      map= this.createMap();
      infoWindow= this.infoWindow;
      this.clearMarkers();
      this.firstLocation= null;
      bounds= this.gmaps.LatLngBounds();
      _.each( this.matchingMapLocations.models, function (loc) {
        var marker, link;
        if( loc.get('distance') > -1 ) {
          point= this.gmaps.latLng( loc.get('latitude'), loc.get('longitude') );
          marker= this.gmaps.marker({
            position:point,
            map:map
          });
          link= $('<a class="map-link"/>')
            .text( loc.get('name') + ' ('+ loc.get('abbreviation') +')' )
            .data('locationId', loc.get('id')).get(0);
          if( ! this.firstLocation ) this.firstLocation= { link:link, marker:marker };
          this.gmaps.addListener(marker, 'click', function () {
            infoWindow.setOptions({ content : link });
            infoWindow.open(map, marker);
          });
          bounds.extend(point);
          markers.push(marker);
        }
      }, this);
      if( markers.length == 1 ) {
        map.setCenter(point);
        // TODO: is this a configuration value?
        map.setZoom(17);
      } else if( markers.length > 0 ) {
        this.map.fitBounds(bounds);
      }
      if( this.firstLocation ) {
        infoWindow.setOptions({ content : this.firstLocation.link });
        this.infoWindow.open( this.createMap(), this.firstLocation.marker );
      }
      this.markers= markers;
      if( ! this.isVisible ) this.$el.hide();
    },

    clickLocation : function (e) {
      e.preventDefault();
      this.trigger('clickLocation', $(e.target).data('locationId') );
    },

    openLocationPoint : function (loc) {
      var $link= $('<a class="map-link"/>')
        .text( loc.get('name') + ' ('+ loc.get('abbreviation') +')' )
        .data('locationId', loc.get('id'));
      this.infoWindow.setOptions({ content : $link.get(0) });
      this.infoWindow.open( this.createMap(), this.markers[0] );
    },

    show : function () {
      this.$el.show();
      this.isVisible= true;
    },

    hide : function () {
      this.$el.hide();
      this.isVisible= false;
    }

  });
  
  /* MAP SEARCH VIEW ******************************
   * 
   */
  var MapSearchFormView= Backbone.View.extend({
    template: '#map-search-form-template',
    className: 'map-search-form',
  
    events : {
      'keypress input[type=text]' : 'submitSearchByEnter'
    },
  
    initialize : function (options) {
      this.mapLocations= options.mapLocations;
      this.mapLocations.fetch().error( function (e) {
        console.log('ERROR WITH LOADING DATA:', e.statusText);
      });
      this.matchingMapLocations= options.matchingMapLocations;
    },
  
    submitSearch : function (e){
      // do search
      var ff= $(e.target).closest('form').get(0).search;
      this.trigger('submitSearch', ff.value);
    },

    submitSearchByEnter : function (e) {
      if( e.keyCode != 13 ) return;
      this.submitSearch(e);
    },

    search : function (query) {
      var matches;
      if( query ) {
        this.matchingMapLocations.defaultLocation= this.mapLocations.defaultLocation;
        query= query.toLowerCase(query);
        matches= _.filter( this.mapLocations.models, function (location) {
          return (
              location.get('categories').toString().indexOf(query) > -1
            ) || ( 
              location.get('searchText') && location.get('searchText').indexOf(query) > -1
            );
        });
        this.matchingMapLocations.reset(matches);
      }
    },
  
    filterByCategory : function (category) {
      var matches;
      if( category ) {
        matches= _.filter( this.mapLocations.models, function (location) {
          return location.get('categories') && _.indexOf( location.get('categories'), category ) > -1;
        });
        this.matchingMapLocations.reset(matches);
      }
    }

  });
  
  /* MAP LOCATION DETAIL VIEW *********************
   * 
   */
  var MapLocationDetailView= Backbone.View.extend({
    template : '#map-location-detail-template',
    className : 'map-location-detail portlet',
    model : new MapLocation(),
  
    events : {
      'click .map-location-back-link' : 'clickBack',
      'click .map-location-map-link' : 'clickViewInMap'
    },
  
    initialize : function (options) {
      this.matchingMapLocations= options.matchingMapLocations;
      this.model.on('change', function () { this.render(); this.$el.trigger("create"); }, this);
    },
  
    serialize : function () {
      return { location : this.model ? this.model.toJSON() : {} };
    },
  
    clickBack : function () {
      this.trigger('clickBack');
    },

    clickViewInMap : function () {
      this.matchingMapLocations.reset(this.model);
      this.trigger('clickViewInMap', this.model.get('id'));
    }
  
  });
  
  /* MAP CATEGORIES VIEW **************************
   * 
   */
  var MapCategoriesView= Backbone.View.extend({
    template : '#map-categories-template',
    className : 'map-categories',
    categories : {},
  
    events : {
      'click a.map-search-link' : 'returnToHome',
      'click a.map-category-link' : 'clickCategory'
    },
  
    initialize : function (options) {
      this.mapLocations= options.mapLocations;
      this.mapLocations.on('reset', function () { this.render(); this.$el.trigger("create"); }, this);
    },
  
    returnToHome : function () {
      this.trigger('returnToHome');
    },
  
    clickCategory : function (e) {
      this.trigger('clickCategory', $(e.target).data('category') );
    },
  
    serialize : function () {
      return { categories : this.mapLocations.categories || {} };
    }

  });
  
  /* MAP CATEGORY DETAIL VIEW *********************
   * 
   */
  var MapCategoryDetailView = Backbone.View.extend({
    template : '#map-category-detail-template',
    events : {
      'click a.map-location-back-link' : 'clickBack',
      'click a.map-location-link' : 'clickLocation'
    },
  
    initialize : function (options) {
      this.matchingMapLocations= options.matchingMapLocations;
      this.categoryName= '';
    },
  
    setCategoryName : function (categoryName) {
      this.categoryName= categoryName.toString();
    },
    
    clickBack : function (e) {
      this.trigger('clickBack');
    },
  
    clickLocation : function (e) {
      var id= $(e.target).data('locationid');
      this.trigger('clickLocation', id);
    },
  
    serialize : function () {
      return { 
        categoryName : this.categoryName, 
        locations : this.matchingMapLocations
      };
    }
  
  });



  /* MAP FOOTER VIEW *********************
   * 
   */
  var MapFooterView = Backbone.View.extend({
    template : '#map-footer-template',
    events : {
      'click a.map-footer-search-link' : 'clickSearch',
      'click a.map-footer-browse-link' : 'clickBrowse'
    },

    clickSearch : function (e) {
      this.trigger('clickSearch');
    },

    clickBrowse : function (e) {
      this.trigger('clickBrowse');
    },

    getSearchTab : function () {
      return this.$searchTab || ( this.$searchTab = $('a.map-footer-search-link') );
    },

    getBrowseTab : function () {
      return this.$browseTab || ( this.$browseTab = $('a.map-footer-browse-link') );
    },

    setNav : function (pageName) {
      var $searchTab= this.getSearchTab(),
          $browseTab= this.getBrowseTab();
      $searchTab[ pageName == 'search' ? 'addClass' : 'removeClass']('ui-btn-active');
      $browseTab[ pageName == 'browse' ? 'addClass' : 'removeClass']('ui-btn-active');
    }

  });
  
  
  /* ********************************************** 
   * *** PORTLET/ROUTER
   * **********************************************
   */
  if( ! google ) {
    throw new Error( 'Could not connect to the Google Maps API. Please try again.' );
  }
  
  var MapPortletRouter= function () {
    var self= this;
  
    /* showOnly()
     * Hide all views except for the ones passed as a parameter.
     * @param views array - array of view objects that are to be shown
     * Note: MapView is a special case. Google Maps doesn't render well in elements with display:none.
     */
    var showOnly = function (views) {
      var allViews= [mapSearchFormView, mapLocationDetailView, mapCategoriesView, mapCategoryDetailView];
      if( ! _.isArray(views) ) alert('Error\nshowOnly(): parameter must be an array.');
      _.each( allViews, function (v) {
        v.$el[ _.indexOf(views, v) == -1 ? 'hide' : 'show' ]();
      });
      //mapView[ _.indexOf(views, mapView) == -1 ? 'hide' : 'show' ]();
      self.layout.$el.find('.map-fullscreen')[ _.indexOf(views, mapView) == -1 ? 'hide' : 'show' ]();
      
      mapFooterView.$el.show();
      self.layout.$el.trigger('create');

      // fix resizing
      if( parseInt( self.layout.$el.find('.map-fullscreen').css('bottom'), 10) == 0 ) {
        self.layout.$el.find('.map-fullscreen').css({
          'bottom' : self.layout.$el.find('.map-footer').outerHeight() + 'px'
        });
        $( window ).trigger( "throttledresize" );
      }
      
    };
    
    var addHistory = function () {
      var args = Array.prototype.slice.call(arguments);
      if( ! self.hasOwnProperty('_history') ) self._history=[];
      self._history.unshift( args );
      self._history= self._history.slice(0,3);
    };
    
    var goBack = function () {
      var i= arguments.length > 0 ? arguments[0] : 1, 
          f= self._history[i];
      if( ! f ) return;
      f[0].apply( self, f.slice(1) );
    };
    
    
    /* VIEWS */
    /* home()
     * Check if doViews() has been run, add view to history, show mapSearch and mapView, set bottom nav to 'search'
     */
    this.home = function () {
      if(_.flatten(this.layout.views).length == 0 ) this.doViews();
      addHistory(this.home);
      showOnly([mapSearchFormView,mapView]);
      mapFooterView.setNav('search');
    };
    
    /* searchResultsMap()
     * 
     */
    this.searchResultsMap = function (q) {
      reloadSearchResultsMap= function () { this.searchResultsMap(q); };
      if( _.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', reloadSearchResultsMap, this);
        return;
      }
      mapLocations.off('reset', reloadSearchResultsMap);
      addHistory(this.searchResultsMap, q);
      showOnly([mapSearchFormView,mapView]);
      mapFooterView.setNav('search');
      mapSearchFormView.search(q);
    };

    /* locationDetail()
     *
     */
    this.locationDetail = function (id) {
      var location, reloadLocationDetail= function () { this.locationDetail(id); };
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', reloadLocationDetail, this);
        return;
      }
      mapLocations.off('reset', reloadLocationDetail);
      addHistory(this.locationDetail, id);
      location= mapLocations.findById(id);
      mapLocationDetailView.model.set( location.toJSON() );
      showOnly([mapLocationDetailView]);
    };

    /* locationMap()
     *
     */
    this.locationMap = function (id) {
      var location, reloadLocationMap= function () { this.locationMap(id); };
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', reloadLocationMap, this);
        return;
      }
      mapLocations.off('reset', reloadLocationMap);
      addHistory(this.locationMap, id);
      location= mapLocations.findById(id);
      mapLocationDetailView.model.set( location.toJSON() );
      showOnly([mapView]);
      matchingMapLocations.reset([location]);
    };

    /* categories()
     *
     */
    this.categories = function () {
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', this.categories, this);
        return;
      }
      mapLocations.off('reset', this.categories);
      addHistory(this.categories);
      showOnly([mapCategoriesView]);
      mapFooterView.setNav('browse');
    };

    /* category()
     *
     */
    this.category = function (category) {
      reloadCategory= function () { this.category(category); };
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', reloadCategory, this);
        return;
      }
      mapLocations.off('reset', reloadCategory);
      addHistory(this.category, category);
      mapFooterView.setNav('browse');
      mapSearchFormView.filterByCategory(category);
      mapCategoryDetailView.setCategoryName(category);
      mapCategoryDetailView.render();
  
      showOnly([mapCategoryDetailView]);
    };
  
    /* doViews()
     * Defines views and listeners for portlet. Should only be run once.
     */
  
    this.doViews = function () {
      // collections
      mapLocations= new MapLocations({url:this.options.data});
      matchingMapLocations= new MatchingMapLocations();
      // views
      mapSearchFormView= new MapSearchFormView({
        mapLocations : mapLocations,
        matchingMapLocations : matchingMapLocations
      });
      mapView= new MapView({
        mapLocations : mapLocations,
        matchingMapLocations : matchingMapLocations,
        mapOptions : this.options.mapOptions
      });
      mapLocationDetailView= new MapLocationDetailView({
        matchingMapLocations : matchingMapLocations
      });
      mapCategoriesView= new MapCategoriesView({
        mapLocations : mapLocations
      });
      mapCategoryDetailView= new MapCategoryDetailView({
        matchingMapLocations : matchingMapLocations
      });
      mapFooterView= new MapFooterView();
  
      this.layout.setViews( {
        '#map-search-form' : mapSearchFormView,
        '#map-container' : mapView,
        '#map-location-detail' : mapLocationDetailView,
        '#map-categories' : mapCategoriesView,
        '#map-category-detail' : mapCategoryDetailView,
        '#map-footer' : mapFooterView
      });
      // Hide all views
      showOnly([]);
      this.layout.render();
  
      /* LISTENERS */
      mapView
        .on('clickLocation', function (id) {
          this.locationDetail( id );
        }, this);
  
      mapLocationDetailView
        .on('clickBack', function () {
          goBack();
        }, this)
        .on('clickViewInMap', function (id) {
          this.locationMap(id);
        }, this);
  
      mapSearchFormView
        .on('clickBrowse', function () {
          this.categories();
        }, this)
        .on('submitSearch', function (query) {
          this.searchResultsMap(query);
        }, this);
  
      mapCategoriesView
        .on('clickCategory', function (category) {
          this.category(category);
        }, this)
        .on('returnToHome', function () {
          this.home();
        }, this);
  
      mapCategoryDetailView
        .on('clickBack', function () {
          goBack();
        }, this)
        .on('clickLocation', function (id) {
          this.locationDetail( id );
        }, this);

      mapFooterView
        .on('clickBrowse', function () {
          this.categories();
        }, this)
        .on('clickSearch', function () {
          this.home();
        }, this);
      /* / LISTENERS */
  
    };
  
   };
  
  /* Change underscore template syntax to work well with JSP. Default is <% %>.
   * The new syntax is "{!  !}" for scripts and "{{ }}" for expressions. So:
   * {! var myVar=42; !}
   * {{ myVar }}
   */
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g,
    evaluate : /\{!(.+?)!\}/g
  };

  /* Create instance of router and start at home() */
  var router = new MapPortletRouter();
  router.layout=  new Backbone.LayoutManager({ template: options.template });
  router.options= options;
  $(document).ready(function () {
    $(options.target).html(router.layout.el);
    router.home();
  });
  
}

