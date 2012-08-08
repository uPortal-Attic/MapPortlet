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
    'location/:id' : 'locationDetail'
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
        mapLocationDetailView= new MapLocationDetailView();
    //matchingMapLocations.on('reset', function () {console.log("\n\nSUCKERS!\n")});
    
    matchingMapLocations.on('select', function (location) {
      console.log('matchingMapLocations.on() args:', arguments);
      mapLocationDetailView.model= location;
      mapLocationDetailView.render();
    });
    
    layout.setView( '#map-search-container', mapSearchContainerView );
    layout.setView( '#map-container', mapView );
    layout.setView( '#map-location-detail', mapLocationDetailView );
    layout.render();
  },
  
  locationDetail : function (id) {
    console.log('\n***\nTODO: Load from url. How is this different than home()?\n***\n\n\n');
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
