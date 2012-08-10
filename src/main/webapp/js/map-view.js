MapView= Backbone.View.extend({
  template: '#N_map-view-template',
  className: 'portlet',

  initialize: function (options) {
    console.log('MapView.initilize()');
    this.mapLocations= options.mapLocations.on('reset', this.createMap, this);
    this.mapLocations.on('reset', this.createMap, this);
    this.matchingMapLocations= options.matchingMapLocations;
    this.matchingMapLocations.on('reset', this.drawMap, this);
    this.router= options.router;
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
    }
    return this.map;
  },

  drawMap : function () {
    var self= this;
    console.log('5. refreshView()');
    console.log('MapView.drawMap()');
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
          var $link= $('<a/>')
            .text( loc.get('name') + ' ('+ loc.get('abbreviation') +')' )
            .bind( 'click', function (e) { console.log(loc.toJSON());self.clickLocation(loc); });
          self.map.openInfoWindow({ content : $link.get(0) }, this);
        });
        //console.log('drawMap() addBounds point:', point);
        self.map.addBounds(point);
        pointCount += 1;
      }
    });
    if( pointCount == 1 ) {
      self.map.option('center', point);
      self.map.option('zoom', 17);
    }
      
  },

  clickLocation : function (location) {
    console.log('MapView.clickLocation() this:', this);
    // TODO: SHOULD NAVIGATE GO INTO MAP.JS? :
    this.router.navigate('location/' + location.get('id') );
    this.matchingMapLocations.trigger('select', location);
  },
  
  hide : function () {
    this.$el.hide();
  },
  
  render: function (manage) {
    console.log('MapView.render()');
    return manage(this).render();
  }
  
});