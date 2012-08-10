if( ! window.google ) {
  throw new Error( 'Could not connect to the Google Maps API. Please try again.' );
}

window.mapPortlet= {
  //mapLocations : new MapLocations()
};

layout= new Backbone.LayoutManager({
  template: '#N_map-template'
});


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
    mapView.$el.fadeTo(0, _.indexOf(views, mapView) == -1 ? 0 : 1 );
  },
  
  home : function () {
    if(_.flatten(layout.views).length == 0 ) this.doViews();
    console.log('+ (home) mapSearchContainerView', mapSearchContainerView);
    this.showOnly([mapSearchContainerView,mapView]);
  },
  
  searchResults : function (q) {
    console.log('ROUTE: search', q);
    reloadSearchResults= function () { this.searchResults(q); };
    if(_.flatten(layout.views).length == 0 ) {
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
    console.log('ROUTE: locationDetail');
    if(_.flatten(layout.views).length == 0 ) {
      this.doViews();
      mapLocations.on('reset', reloadLocationDetail, this);
      return;
    }
    mapLocations.off('reset', reloadLocationDetail);
    location= mapLocations.findById(id);
    mapLocationDetailView.model.set(location.toJSON());
    this.showOnly([mapLocationDetailView]);
  },

  locationMap : function (id) {
    console.log('ROUTE: locationMap');
    if(_.flatten(layout.views).length == 0 ) this.doViews();
  },
  
  browse : function () {
    console.log('ROUTE: browse');
    if(_.flatten(layout.views).length == 0 ) {
      this.doViews();
      mapLocations.on('reset', this.browse, this)
      return;
    }
    mapLocations.off('reset', this.browse);
    this.showOnly([mapCategoriesView]);
  },

  category : function (category) {
    console.log('ROUTE: category:', category);
    reloadCategory= function () { this.category(category); };
    if(_.flatten(layout.views).length == 0 ) {
      this.doViews();
      mapLocations.on('reset', reloadCategory, this);
      return;
    }
    mapLocations.off('reset', reloadCategory);
    this.showOnly([mapView,mapCategoryDetailView]);
    mapSearchContainerView.filterByCategory(category);
  },
  
  
  
  doViews : function () {
    console.log("doViews()");
    // collections
    mapLocations= new MapLocations();
    matchingMapLocations= new MatchingMapLocations();
    // views
    mapSearchContainerView= new MapSearchContainerView({
      mapLocations : mapLocations,
      matchingMapLocations : matchingMapLocations
    });
    mapView= new MapView({
      mapLocations : mapLocations,
      matchingMapLocations : matchingMapLocations,
      router : this
    });
    mapLocationDetailView= new MapLocationDetailView({
      matchingMapLocations : matchingMapLocations
    });
    mapCategoriesView= new MapCategoriesView({
      mapLocations : mapLocations
    });
    mapCategoryDetailView= new MapCategoryDetailView();

    layout.setViews( {
      '#map-search-container' : mapSearchContainerView,
      '#map-container' : mapView,
      '#map-location-detail' : mapLocationDetailView,
      '#map-categories' : mapCategoriesView,
      '#map-category-detail' : mapCategoryDetailView
    });
    // Hide all views
    this.showOnly([]);
    layout.render();
    
    /* LISTENERS */
    mapView
      .on('clickLocation', function (id) {
        this.navigate('location/'+id)
        this.locationDetail( id );
      }, this);
    matchingMapLocations
      .on('one', function () {
        console.log('listener one');
        this.navigate('');
        this.showOnly([mapSearchContainerView,mapView]);
      }, this)
      .on('reset', function () {
        console.log('+listener reset');
        //mapLocationDetailView.trigger('returnToSearchResults');
      }, this);
    
    mapLocationDetailView
      .on('returnToSearchResults', function () {
        console.log('listener mapLocationDetailView() returnToSearchResults');
        this.navigate('');
        this.home();
      }, this);
    
    mapSearchContainerView
      .on('clickBrowse', function () {
        console.log('listener clickBrowse');
        this.navigate('browse');
        this.browse();
      }, this)
      .on('submitSearch', function (query) { 
        this.navigate('search/' + encodeURI(query));
        this.searchResults(query);
      }, this);
    
    mapCategoriesView
      .on('clickCategory', function (category) {
        console.log('+listener clickCategory');
        this.navigate('browse/' + encodeURI(category));
        this.category(category);
      }, this)
      .on('returnToHome', function () {
        console.log('+listener mapCategoriesView returnToSearchResults');
        this.navigate('');
        this.home();
      }, this);
    
    mapCategoryDetailView
      .on('clickBack', function () {
        console.log('listener mapCategoryDetailView() clickBack');
        this.navigate('browse');
        this.browse();
      }, this);
    /* / LISTENERS */
    
  }
  
});

window.mapPortlet.router= new MapPortletRouter();

mapPortlet.router.on('route', function (e) {
  console.log('mapPortlet.router on[ROUTE]');
  layout.removeViews();
  if( mapPortlet.router.currentView )
    mapPortlet.router.currentView.removeView();
});


/* Get URL Path */
ROOT= 'http://map.dev/src/main/webapp/WEB-INF/jsp/map.html';
console.log(ROOT);
/*
urlParts= window.location.toString().split(ROOT);
urlRoute= urlParts.length > 1 ? urlParts[1].split('/')[0] : undefined;
console.log( ">> routing:", ROOT, urlParts, urlRoute );
*/

$(document).ready(function () {
  // Set Top Level Layout. Attach to DOM
  $('#N_map').html(layout.el);
  layout.render();
  // Handle History, Routing
  Backbone.history.start({root:ROOT});
  /*
  if( urlRoute ) {
    console.log('Starting route at:', urlRoute);
  } else {
    console.log('Navigating route to home.');
    //mapPortlet.router.navigate('home', {trigger:true});
  }
*/
});
