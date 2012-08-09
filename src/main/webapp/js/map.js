if( ! window.google ) {
  throw new Error( 'Could not connect to the Google Maps API. Please try again.' );
}

window.mapPortlet= {
  mapLocations : new MapLocations()
};

layout= new Backbone.LayoutManager({
  template: '#N_map-template'
});


MapPortletRouter= Backbone.Router.extend({
  routes: {
    '': 'home',
    //'map.html': 'home',
    //'home': 'home',
    //'location/:id' : 'locationDetail'
    'location/:id' : 'home', // temporary,
    // location/:id/map : 'locationMap'
    'browse' : 'browse'
  },
  
  home : function () {
    this.doViews();
    console.log('+ (home) mapSearchContainerView', mapSearchContainerView);
    mapCategoriesView.$el.hide();
    mapLocationDetailView.$el.hide();
    mapSearchContainerView.$el.show();
    mapView.$el.show();
  },
  doViews : function () {
    console.log("ROUTE: home");
    mapLocations= new MapLocations();
        matchingMapLocations= new MatchingMapLocations();
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

    layout.setViews( {
      '#map-search-container' : mapSearchContainerView,
      '#map-container' : mapView,
      '#map-location-detail' : mapLocationDetailView,
      '#map-categories' : mapCategoriesView
    });
    layout.render();
    //mapLocationDetailView.$el.hide();
    
    /* LISTENERS */
    matchingMapLocations
      .on('select', function (location) {
        console.log('listener select');
        mapLocationDetailView.model.set(location.toJSON());
        mapLocationDetailView.$el.show();
        mapSearchContainerView.$el.hide();
        mapView.$el.hide();
        mapCategoriesView.$el.hide();
        console.log(layout);
      })
      .on('one', function () {
        console.log('listener one');
        mapLocationDetailView.$el.hide();
        mapSearchContainerView.$el.show();
        mapView.$el.show();
        mapCategoriesView.$el.hide();
      })
      .on('reset', function () {
        console.log('listener reset');
        mapLocationDetailView.trigger('returnToSearchResults');
      }, this);
    ;
    
    mapLocationDetailView.on('returnToSearchResults', function () {
      console.log('listener returnToSearchResults');
      mapLocationDetailView.$el.hide();
      mapSearchContainerView.$el.show();
      mapView.$el.show();
      mapCategoriesView.$el.hide();
    });
    
    mapSearchContainerView.on('clickBrowse', function () {
      console.log('listener clickBrowse');
      this.navigate('browse');
      //this.browse();
      mapLocationDetailView.$el.hide();
      mapSearchContainerView.$el.hide();
      mapView.$el.hide();
      mapCategoriesView.$el.show();
    }, this);
    
    mapCategoriesView.on('clickCategory', function (category) {
      console.log('+listener clickCategory');
      mapSearchContainerView.filterByCategory(category);
    }, this);
    /* / LISTENERS */
    
  },
  
  locationDetail : function (id) {
    console.log('\n***\nTODO: Load from url. How is this different than home()?\n***\n\n\n');
  },
  
  browse : function () {
    console.log('ROUTE: browse');
    this.doViews();
    mapLocationDetailView.$el.hide();
    mapSearchContainerView.$el.hide();
    mapView.$el.hide();
    mapCategoriesView.$el.show();
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
