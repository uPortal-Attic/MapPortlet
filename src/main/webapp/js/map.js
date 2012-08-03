window.mapPortlet= {};

layout= new Backbone.LayoutManager({
  template: '#N_map-template'
});


MapPortletRouter= Backbone.Router.extend({
  routes: {
    '': 'home',
    'map.html': 'home',
    'home': 'home'
  },
  
  home : function () {
    console.log("ROUTE: home");
    console.log("home() layout?", layout);
    
    var view= new MapView();
    console.log("home() view?", view);
    if( layout ) layout.setView('#map-search-container', view);
    view.render();
    /*
    $('#N_map').empty();
    $('#N_map').append( view.render().el );
    console.log( view );
    */
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
ROOT= 'http://map.dev/src/main/webapp/WEB-INF/jsp/';
urlParts= window.location.toString().split(ROOT);
urlRoute= urlParts.length > 1 ? urlParts[1].split('/')[0] : undefined;

$(document).ready(function () {
  // Set Top Level Layout. Attach to DOM
  $('#N_map').html(layout.el);
  layout.render();
  
  // Handle History, Routing
  Backbone.history.start({root:ROOT});
  if( urlRoute ) {
    console.log('Starting route at:', urlRoute);
  } else {
    console.log('Navigating route to home.');
    mapPortlet.router.navigate('home', {trigger:true});
  }

});
