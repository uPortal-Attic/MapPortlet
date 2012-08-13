MapView= Backbone.View.extend({
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
    this.router= options.router;
    this.isVisible= true;
  },
  
  createMap : function () {
    var coords, self= this;
    if( ! this.map ) {
      if( ! this.isVisible ) { console.log("drawMap() NOT VISIBLE.");return false; }
      /*if( ! this.isVisible ) {
        console.log('+ mapView.createMap() show ===');
        this.$el.fadeTo(0,0);
        this.$el.show();
      }*/
      coords= this.mapLocations.defaultLocation;
      latLng= new window.google.maps.LatLng(coords.latitude, coords.longitude);
      /*
      TODO: how to make this dynamic
       */
      this.$map = this.$el.find('.map-display').gmap({
        center:latLng,

        zoom: 12,//${ zoom },
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
      /*
      this.mapmap= this.$map.gmap('get', 'map');
      
      if( ! this.isVisible ) {
        google.maps.event.addListenerOnce(this.mapmap, 'idle', function () {
          console.log('+ mapView.createMap() hide ===');
          self.$el.hide();
          self.$el.fadeTo(0,1);
        });
      }
      */
      
    }
    return this.map;
  },

  drawMap : function () {
    var self= this;
    if( ! this.isVisible ) { console.log("drawMap() NOT VISIBLE.");return false; }
    this.createMap();
    this.map.clear('markers');
    var bounds= new window.google.maps.LatLngBounds(),
        point,
        pointCount= 0;
    _.each( this.matchingMapLocations.models, function (loc) {
      var marker;
      if( loc.get('distance') > -1 ) {
        point= new window.google.maps.LatLng( loc.get('latitude'), loc.get('longitude') );
        marker= self.map.addMarker({ position : point });
        marker.click( function () {
          var $link= $('<a class="map-link"/>')
            .text( loc.get('name') + ' ('+ loc.get('abbreviation') +')' )
            .data('locationId', loc.get('id'));
          self.map.openInfoWindow({ content : $link.get(0) }, this);
        });
        self.map.addBounds(point);
        pointCount += 1;
      }
    });
    if( pointCount == 1 ) {
      self.map.option('center', point);
      self.map.option('zoom', 17);
    }
      
  },

  clickLocation : function (e) {
    e.preventDefault();
    this.trigger('clickLocation', $(e.target).data('locationId') );
  },
  
  show : function () {
    //this.$el.fadeTo(0,1);
    this.$el.show();
    this.isVisible= true;
    console.log('+ mapView.show() ---');
  },
  
  hide : function () {
    console.log('+ mapView.hide() ---');
    this.$el.hide();
    this.isVisible= false;
  }
  
});