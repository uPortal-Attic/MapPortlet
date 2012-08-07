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
    var self= this;
    console.log('5. refreshView()');
    console.log('MapView.drawMap()');
    this.createMap();
    //this.$map.gmap('clear','markers');
    this.map.clear('markers');
    var bounds= new window.google.maps.LatLngBounds();
    _.each( this.matchingMapLocations.models, function (loc) {
      var point, marker;
      console.log( 'MARKER', loc.get('distance') );
      if( loc.get('distance') > -1 ) {
        point= new window.google.maps.LatLng( loc.get('latitude'), loc.get('longitude') );
        marker= self.map.addMarker({ position : point });
        marker.click( function () {
          var $link= $('<a/>')
            .text( loc.get('name') + ' ('+ loc.get('abbreviation') +')' )
            .bind( 'click', function (e) {
              // TODO: RENDER LOCATION DETAIL VIEW
            });
          self.map.openInfoWindow({ content : $link.get(0) }, this);
        });
        self.map.addBounds(point);
      }
      
    });
    
  },
  
  render: function (manage) {
    console.log('MapView.render()');
    r= manage(this).render();
    
    
    return r;
  }
  
});