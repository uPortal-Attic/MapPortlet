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
    console.log("ROUTE: home");
    var mapLocations= new MapLocations(),
        matchingMapLocations= new MatchingMapLocations(),
        mapSearchContainerView= new MapSearchContainerView({
          mapLocations : mapLocations,
          matchingMapLocations : matchingMapLocations
        }),
        mapView= new MapView({
          mapLocations : mapLocations,
          matchingMapLocations : matchingMapLocations,
          router : this
        }),
        mapLocationDetailView= new MapLocationDetailView({
          matchingMapLocations : matchingMapLocations
        });
    
    /* LISTENERS */
    matchingMapLocations
      .on('select', function (location) {
        console.log('matchingMapLocations.on() select');
        mapLocationDetailView.model.set(location.toJSON());
        mapLocationDetailView.$el.show();
        mapSearchContainerView.$el.hide();
        mapView.$el.hide();
        console.log(layout);
      })
      .on('one', function () {
        console.log('matchingMapLocations.on() one');
        mapLocationDetailView.$el.hide();
        mapSearchContainerView.$el.show();
        mapView.$el.show();
      });
    
    mapLocationDetailView.on('returnToSearchResults', function () {
      mapLocationDetailView.$el.hide();
      mapSearchContainerView.$el.show();
      mapView.$el.show();
    });
    
    mapSearchContainerView.on('clickBrowse', function () {
      console.log('+SHOW BROWSE');
      this.navigate('browse');
      this.browse();
    }, this);
    
    layout.setViews( {
      '#map-search-container' : mapSearchContainerView,
      '#map-container' : mapView
    });
    layout.render();
    // DON'T RENDER YET
    layout.setViews({ '#map-location-detail' : mapLocationDetailView });
    mapLocationDetailView.$el.hide();
  },
  
  locationDetail : function (id) {
    console.log('\n***\nTODO: Load from url. How is this different than home()?\n***\n\n\n');
  },
  
  browse : function () {
    console.log('+ROUTE: browse');
    console.log('layout.getViews()', layout.getViews());
    var mapLocations= new MapLocations();
        mapCategoriesView= new MapCategoriesView({
          mapLocations : mapLocations
        });
    layout.setView( '#map-categories', mapCategoriesView );
    layout.render();
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
