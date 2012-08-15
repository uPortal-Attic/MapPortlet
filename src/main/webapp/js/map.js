if( ! window.google ) {
  throw new Error( 'Could not connect to the Google Maps API. Please try again.' );
}

MapPortletRouter= Backbone.Router.extend({
  routes: {
    '': 'home',
    'search/:query' : 'searchResults',
    'location/:id' : 'locationDetail',
    'location/:id/map' : 'locationMap',
    'browse' : 'browse',
    'browse/:category' : 'category'
  },
  
  /* showOnly()
   * Hide all views except for the ones passed as a parameter.
   * @param views array - array of view objects that are to be shown
   * Note: MapView is a special case. Google Maps doesn't render well in elements with display:none.
   */
  showOnly : function (views) {
    var allViews= [mapSearchContainerView, mapLocationDetailView, mapCategoriesView, mapCategoryDetailView];
    if( ! _.isArray(views) ) alert('Error\nshowOnly(): parameter must be an array.');
    _.each( allViews, function (v) {
      v.$el[ _.indexOf(views, v) == -1 ? 'hide' : 'show' ]();
    });
    //mapView.$el.fadeTo(0, _.indexOf(views, mapView) == -1 ? 0 : 1 );
    mapView[ _.indexOf(views, mapView) == -1 ? 'hide' : 'show' ]();
  },
  
  home : function () {
    if(_.flatten(this.layout.views).length == 0 ) this.doViews();
    this.showOnly([mapSearchContainerView,mapView]);
  },
  
  searchResults : function (q) {
    reloadSearchResults= function () { this.searchResults(q); };
    if(_.flatten(this.layout.views).length == 0 ) {
      this.doViews();
      mapLocations.on('reset', reloadSearchResults, this);
      return;
    }
    mapLocations.off('reset', reloadSearchResults);
    this.showOnly([mapSearchContainerView,mapView]);
    mapSearchContainerView.search(q);
  },

  locationDetail : function (id) {
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
  },

  locationMap : function (id) {
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
  },
  
  browse : function () {
    if(_.flatten(this.layout.views).length == 0 ) {
      this.doViews();
      mapLocations.on('reset', this.browse, this)
      return;
    }
    mapLocations.off('reset', this.browse);
    this.showOnly([mapCategoriesView]);
  },

  category : function (category) {
    reloadCategory= function () { this.category(category); };
    if(_.flatten(this.layout.views).length == 0 ) {
      this.doViews();
      mapLocations.on('reset', reloadCategory, this);
      return;
    }
    mapLocations.off('reset', reloadCategory);
    this.showOnly([mapView,mapCategoryDetailView]);
    mapSearchContainerView.filterByCategory(category);
    mapCategoryDetailView.render();
    
  },
  
  
  
  doViews : function () {
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

    this.layout.setViews( {
      '#map-search-container' : mapSearchContainerView,
      '#map-container' : mapView,
      '#map-location-detail' : mapLocationDetailView,
      '#map-categories' : mapCategoriesView,
      '#map-category-detail' : mapCategoryDetailView
    });
    // Hide all views
    this.showOnly([]);
    this.layout.render();
    
    /* LISTENERS */
    mapView
      .on('clickLocation', function (id) {
        this.navigate('location/'+id)
        this.locationDetail( id );
      }, this);
    
    mapLocationDetailView
      .on('returnToSearchResults', function () {
        this.navigate('');
        this.home();
      }, this)
      .on('clickLocation', function (id) {
        this.navigate('location/'+id+'/map');
        this.locationMap(id);
      }, this);
    
    mapSearchContainerView
      .on('clickBrowse', function () {
        this.navigate('browse');
        this.browse();
      }, this)
      .on('submitSearch', function (query) { 
        this.navigate('search/' + encodeURI(query));
        this.searchResults(query);
      }, this);
    
    mapCategoriesView
      .on('clickCategory', function (category) {
        this.navigate('browse/' + encodeURI(category));
        this.category(category);
      }, this)
      .on('returnToHome', function () {
        this.navigate('');
        this.home();
      }, this);
    
    mapCategoryDetailView
      .on('clickBack', function () {
        this.navigate('browse');
        this.browse();
      }, this)
      .on('clickLocation', function (id) {
        this.navigate('location/'+id);
        this.locationDetail( id );
      }, this);
    /* / LISTENERS */
    
  }
  
});

_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g,
  evaluate : /\{!(.+?)!\}/g
};

function MapPortlet( options ) {
  var router = new MapPortletRouter();
  router.layout=  new Backbone.LayoutManager({ template: options.template });
  router.options= options;
  $(document).ready(function () {
    $(options.target).html(router.layout.el);
    Backbone.history.start({root:options.root});
  });
  return {
    router : router
  };
}

