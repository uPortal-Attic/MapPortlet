MapPortlet= function ( $, _, Backbone, google, options ) {
  
  
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
        if( ! this.isVisible ) return false;
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
      if( ! this.markers ) this.markers=[];
      for( m=0; m<this.markers.length; m+=1) {
        this.markers[m].setMap(null);
      };
      this.markers= [];
    },
  
    drawMap : function () {
      var map, infoWindow, point, bounds, markers=[];
      if( ! this.isVisible ) return false;
      map= this.createMap();
      infoWindow= this.infoWindow;
      this.clearMarkers();
      bounds= this.gmaps.LatLngBounds();
      _.each( this.matchingMapLocations.models, function (loc) {
        var marker;
        if( loc.get('distance') > -1 ) {
          point= this.gmaps.latLng( loc.get('latitude'), loc.get('longitude') );
          marker= this.gmaps.marker({
            position:point,
            map:map
          });
          this.gmaps.addListener(marker, 'click', function () {
            var $link= $('<a class="map-link"/>')
              .text( loc.get('name') + ' ('+ loc.get('abbreviation') +')' )
              .data('locationId', loc.get('id'));
            infoWindow.setOptions({ content : $link.get(0) });
            infoWindow.open(map, marker);
          });
          bounds.extend(point);
          markers.push(marker);
        }
      }, this);
      if( markers.length == 1 ) {
        map.setCenter(point);
        map.setZoom(17);
      } else if( markers.length > 0 ) {
        this.map.fitBounds(bounds);
      }
      this.markers= markers;
    },
  
    clickLocation : function (e) {
      e.preventDefault();
      this.trigger('clickLocation', $(e.target).data('locationId') );
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
  var MapSearchContainerView= Backbone.View.extend({
    template: '#map-search-container-template',
    className: 'map-search-container',
  
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
      //this.search(ff.value);
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
          return location.get('searchText') && location.get('searchText').indexOf(query) > -1;
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
      'click .map-location-back-link' : 'returnToSearchResults',
      'click .map-location-map-link' : 'clickLocation'
    },
  
    initialize : function (options) {
      this.matchingMapLocations= options.matchingMapLocations;
      this.model.on('change', this.render, this);
    },
  
    serialize : function () {
      return { location : this.model ? this.model.toJSON() : {} };
    },
  
    returnToSearchResults : function () {
      this.trigger('returnToSearchResults');
    },
  
    clickLocation : function () {
      this.matchingMapLocations.reset(this.model);
      this.trigger('clickLocation', this.model.get('id'));
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
      this.mapLocations.on('reset', this.render, this);
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
      'click a.map-category-back-link' : 'clickBack',
      'click a.map-location-link' : 'clickLocation'
    },
  
    initialize : function (options) {
      this.matchingMapLocations= options.matchingMapLocations;
    },
  
    clickBack : function (e) {
      this.trigger('clickBack');
    },
  
    clickLocation : function (e) {
      var id= $(e.target).data('locationid');
      this.trigger('clickLocation', id);
    },
  
    serialize : function () {
      return { locations : this.matchingMapLocations };
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
      console.log('clickSearch');
      this.trigger('clickSearch');
    },

    clickBrowse : function (e) {
      console.log('clickBrowse');
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
    },
    
    render : function (manage) {
      this.trigger('render');
      r= manage(this).render();
      this.$el.parent().trigger('create');
      return r;
    }
  });
  
  
  /* ********************************************** 
   * *** PORTLET/ROUTER
   * **********************************************
   */
  if( ! google ) {
    throw new Error( 'Could not connect to the Google Maps API. Please try again.' );
  }
  
  //var MapPortletRouter= Backbone.Router.extend({
  var MapPortletRouter= function () {
    /*
    //routes: {
    this.routes= {
      '': 'home',
      'search/:query' : 'searchResults',
      'location/:id' : 'locationDetail',
      'location/:id/map' : 'locationMap',
      'browse' : 'browse',
      'browse/:category' : 'category'
    //},
    };
    */
  
    /* showOnly()
     * Hide all views except for the ones passed as a parameter.
     * @param views array - array of view objects that are to be shown
     * Note: MapView is a special case. Google Maps doesn't render well in elements with display:none.
     */
    //showOnly : function (views) {
    this.showOnly = function (views) {
      var allViews= [mapSearchContainerView, mapLocationDetailView, mapCategoriesView, mapCategoryDetailView];
      if( ! _.isArray(views) ) alert('Error\nshowOnly(): parameter must be an array.');
      _.each( allViews, function (v) {
        v.$el[ _.indexOf(views, v) == -1 ? 'hide' : 'show' ]();
      });
      //mapView.$el.fadeTo(0, _.indexOf(views, mapView) == -1 ? 0 : 1 );
      mapView[ _.indexOf(views, mapView) == -1 ? 'hide' : 'show' ]();
      mapFooterView.$el.show();
//    },
    };
    
  
//    home : function () {
    this.home = function () {
      if(_.flatten(this.layout.views).length == 0 ) this.doViews();
      this.showOnly([mapSearchContainerView,mapView]);
      mapFooterView.setNav('search');
//    },
    };
  
    this.searchResults = function (q) {
      reloadSearchResults= function () { this.searchResults(q); };
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', reloadSearchResults, this);
        return;
      }
      mapLocations.off('reset', reloadSearchResults);
      this.showOnly([mapSearchContainerView,mapView]);
      mapFooterView.setNav('search');
      mapSearchContainerView.search(q);
    };

    this.locationDetail = function (id) {
      var location, reloadLocationDetail= function () { this.locationDetail(id); };
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', reloadLocationDetail, this);
        return;
      }
      mapLocations.off('reset', reloadLocationDetail);
      location= mapLocations.findById(id);
      mapLocationDetailView.model.set( location.toJSON() );
      this.showOnly([mapLocationDetailView]);
    };

    this.locationMap = function (id) {
      var location, reloadLocationMap= function () { this.locationMap(id); };
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', reloadLocationMap, this);
        return;
      }
      mapLocations.off('reset', reloadLocationMap);
      location= mapLocations.findById(id);
      mapLocationDetailView.model.set( location.toJSON() );
      this.showOnly([mapLocationDetailView,mapView]);
      matchingMapLocations.reset([location]);
    };

    this.browse = function () {
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', this.browse, this);
        return;
      }
      mapLocations.off('reset', this.browse);
      this.showOnly([mapCategoriesView]);
      mapFooterView.setNav('browse');
    };

    this.category = function (category) {
      reloadCategory= function () { this.category(category); };
      if(_.flatten(this.layout.views).length == 0 ) {
        this.doViews();
        mapLocations.on('reset', reloadCategory, this);
        return;
      }
      mapLocations.off('reset', reloadCategory);
      this.showOnly([mapView,mapCategoryDetailView]);
      mapFooterView.setNav('browse');
      mapSearchContainerView.filterByCategory(category);
      mapCategoryDetailView.render();
  
    };
  
  
//    doViews : function () {
    this.doViews = function () {
      // collections
      mapLocations= new MapLocations({url:this.options.data});
      matchingMapLocations= new MatchingMapLocations();
      // views
      mapSearchContainerView= new MapSearchContainerView({
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
        '#map-search-container' : mapSearchContainerView,
        '#map-container' : mapView,
        '#map-location-detail' : mapLocationDetailView,
        '#map-categories' : mapCategoriesView,
        '#map-category-detail' : mapCategoryDetailView,
        '#map-footer' : mapFooterView
      });
      // Hide all views
      this.showOnly([]);
      this.layout.render();
  
      /* LISTENERS */
      mapView
        .on('clickLocation', function (id) {
          // this.navigate('location/'+id)
          this.locationDetail( id );
        }, this);
  
      mapLocationDetailView
        .on('returnToSearchResults', function () {
          // this.navigate('');
          this.home();
        }, this)
        .on('clickLocation', function (id) {
          // this.navigate('location/'+id+'/map');
          this.locationMap(id);
        }, this);
  
      mapSearchContainerView
        .on('clickBrowse', function () {
          // this.navigate('browse');
          this.browse();
        }, this)
        .on('submitSearch', function (query) {
          // this.navigate('search/' + encodeURI(query));
          this.searchResults(query);
        }, this);
  
      mapCategoriesView
        .on('clickCategory', function (category) {
          // this.navigate('browse/' + encodeURI(category));
          this.category(category);
        }, this)
        .on('returnToHome', function () {
          // this.navigate('');
          this.home();
        }, this);
  
      mapCategoryDetailView
        .on('clickBack', function () {
          // this.navigate('browse');
          this.browse();
        }, this)
        .on('clickLocation', function (id) {
          // this.navigate('location/'+id);
          this.locationDetail( id );
        }, this);

      mapFooterView
        .on('clickBrowse', function () {
          this.browse();
        }, this)
        .on('clickSearch', function () {
          this.home();
        }, this)
        .on('render', function () {
          console.log('R', arguments, this, $(this), this.layout.$el.get(0) );
          //this.mapFooterView.$el.trigger('create');
          this.layout.$el.trigger('create');
        }, this);
      /* / LISTENERS */
  
//    }
    };
  
   };
  //};
  
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g,
    evaluate : /\{!(.+?)!\}/g
  };

  var router = new MapPortletRouter();
  router.layout=  new Backbone.LayoutManager({ template: options.template });
  router.options= options;
  $(document).ready(function () {
    $(options.target).html(router.layout.el);
    //Backbone.history.start({root:options.root});
    router.home();
  });
  return {
    router : router
  };
}

