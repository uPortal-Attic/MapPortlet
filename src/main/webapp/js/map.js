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
  
  home : function () {
    if(_.flatten(layout.views).length == 0 ) this.doViews();
    console.log('+ (home) mapSearchContainerView', mapSearchContainerView);
    mapCategoriesView.$el.hide();
    mapLocationDetailView.$el.hide();
    mapSearchContainerView.$el.show();
    mapView.$el.fadeTo(0,1);
  },

  locationDetail : function (id) {
    console.log('ROUTE: locationDetail');
    if(_.flatten(layout.views).length == 0 ) this.doViews();
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
    
    mapLocationDetailView.$el.hide();
    mapSearchContainerView.$el.hide();
    mapView.$el.fadeTo(0,0);
    mapCategoriesView.$el.show();
  },

  category : function (category) {
    console.log('ROUTE: category:', category);
    reloadCategory= function () { this.category(category); };
    if(_.flatten(layout.views).length == 0 ) {
      this.doViews();
      mapLocations.on('reset', reloadCategory, this);
      mapLocations.on('reset', function () {console.log('TEST RESET');}, this);
      return;
    }
    mapLocations.off('reset', reloadCategory);
    mapSearchContainerView.filterByCategory(category);
    
    mapSearchContainerView.$el.hide();
    mapView.$el.fadeTo(0,1);
    mapLocationDetailView.$el.hide();
    mapCategoriesView.$el.hide();
    mapCategoryDetailView.$el.show();
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
    layout.render();
    
    /* LISTENERS */
    matchingMapLocations
      .on('select', function (location) {
        console.log('listener select');
        mapLocationDetailView.model.set(location.toJSON());
        mapLocationDetailView.$el.show();
        mapSearchContainerView.$el.hide();
        mapView.$el.fadeTo(0,1);
        mapCategoriesView.$el.hide();
        mapCategoryDetailView.$el.hide();
      })
      .on('one', function () {
        console.log('listener one');
        this.navigate('');
        // TODO: DUPLICATED CODE
        mapLocationDetailView.$el.hide();
        mapSearchContainerView.$el.show();
        mapView.$el.fadeTo(0,1);
        mapCategoriesView.$el.hide();
        mapCategoryDetailView.$el.hide();
      })
      .on('reset', function () {
        console.log('+listener reset');
        //mapLocationDetailView.trigger('returnToSearchResults');
      }, this);
    ;
    
    mapLocationDetailView
      .on('returnToSearchResults', function () {
        console.log('listener mapLocationDetailView() returnToSearchResults');
        // TODO: DUPLICATED CODE
        this.navigate('');
        mapLocationDetailView.$el.hide();
        mapSearchContainerView.$el.show();
        mapView.$el.fadeTo(0,1);
        mapCategoriesView.$el.hide();
        mapCategoryDetailView.$el.hide();
      }, this);
    
    mapSearchContainerView
      .on('clickBrowse', function () {
        console.log('listener clickBrowse');
        this.navigate('browse');
        //this.browse();
        mapLocationDetailView.$el.hide();
        mapSearchContainerView.$el.hide();
        mapView.$el.fadeTo(0,0);
        mapCategoriesView.$el.show();
        mapCategoryDetailView.$el.hide();
      }, this)
      .on('submitSearch', function (query) { 
        this.navigate('search/' + encodeURI(query));
      }, this)
      .on('filterByCategory', function () {
        console.log('DEPRECATED... now to filter by category :)');
      }, this);
    
    mapCategoriesView
      .on('clickCategory', function (category) {
        console.log('+listener clickCategory');
        this.navigate('browse/' + encodeURI(category))
        this.category(category);
      }, this)
      .on('returnToHome', function () {
        console.log('+listener mapCategoriesView returnToSearchResults');
        this.navigate('');
        this.home();
        /*
        mapLocationDetailView.$el.hide();
        mapSearchContainerView.$el.show();
        mapView.$el.fadeTo(0,1);
        mapCategoriesView.$el.hide();
        */
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
