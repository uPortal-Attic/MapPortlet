MapView= Backbone.View.extend({
  template: '#N_map-view-template',
  className: 'portlet',

  initialize: function (options) {
    console.log('MapView.initilize()');
    this.mapLocations= options.mapLocations.on('reset', this.createMap, this);
    this.mapLocations.on('reset', this.createMap, this);
    this.matchingMapLocations= options.matchingMapLocations;
    this.matchingMapLocations.on('reset', this.drawMap, this);
  },
  
  createMap : function () {
    var coords, self;
    if( ! this.map ) {
      self= this;
      coords= this.mapLocations.defaultLocation;
      latLng= new window.google.maps.LatLng(coords.latitude, coords.longitude);
      /*
      TODO: how to make this dynamic
       */
      this.$map = this.$el.find('.map-display').gmap({
        center:latLng,

        zoom: 18,//${ zoom },
        mapTypeControl: true,//${ mapTypeControl },
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DEFAULT
        },
        panControl: false,//${ panControl },
        zoomControl: true,//${ zoomControl },
        zoomControlOptions: {
          style: window.google.maps.ZoomControlStyle.SMALL
        },
        scaleControl: true,//${ scaleControl },
        streetViewControl: true,//${ streetView },
        rotateControl: false,//${ rotateControl },
        overviewMapControl: false,//${ overviewControl },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        
        callback: function () { self.map= this; }
      });
    }
    return this.map;
  },

  drawMap : function () {
    console.log('5. refreshView()');
    console.log('MapView.drawMap()');
    this.createMap();
    //this.$map.gmap('clear','markers');
    this.map.clear('markers');
    var bounds= new window.google.maps.LatLngBounds();
    /*
    _.each( this.matchingMapLocations.models, function (loc) {
      //console.log(':)');
    });
    */
    /*
     TODO: initialize map
     map.clear('markers');
     bounds= new window.google.maps.LatLngBounds();
     _.each( this.matchingMapLocations.models, function (loc) {
     // this goes in the model
     loc.distance = getDistance(
     {
     latitude : map.option('center').lat(),
     longitude : that.map.option('center').lng()
     }, 
     { 
     latitude: location.latitude,
     longitude: location.longitude 
     },
     );

     */
  },
  
  render: function (manage) {
    console.log('MapView.render()');
    r= manage(this).render();
    
    
    return r;
  }
  
});