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
    this.isVisible= true;
    this.mapOptions= options.mapOptions;
  },
  
  gmaps : {
    newMap : function (div, options) {
      return new window.google.maps.Map( div, options );
    },
    latLng : function (latitude, longitude) {
      return new window.google.maps.LatLng(latitude, longitude);
    },
    infoWindow : function () {
      return new window.google.maps.InfoWindow();
    },
    LatLngBounds : function () {
      return new window.google.maps.LatLngBounds();
    },
    marker : function (options) {
      return new window.google.maps.Marker(options);
    },
    addListener : function (target, event, callback) {
      window.google.maps.event.addListener(target, event, callback);
    }
  },
  
  createMap : function () {
    var coords;
    if( ! this.map ) {
      if( ! this.isVisible ) return false;
      coords= this.mapLocations.defaultLocation;
      latLng= this.gmaps.latLng(coords.latitude, coords.longitude);
      this.mapOptions.center= latLng;
      // TODO: DON'T HARD CODE SELECTORS!
      this.map= this.gmaps.newMap( $('.map-display', this.$el).get(0), this.mapOptions );
      this.infoWindow= this.gmaps.infoWindow();
    }
    return this.map;
  },
  
  clearMarkers : function () {
    if( ! this.markers ) this.markers=[];
    for( m=0; m<this.markers.length; m+=1) {
      this.markers[m].setMap(null);
    };
    this.markers= [];
  },

  drawMap : function () {
    var map, infoWindow, point, bounds, markers=[];
    if( ! this.isVisible ) return false;
    map= this.createMap();
    infoWindow= this.infoWindow;
    this.clearMarkers();
    bounds= this.gmaps.LatLngBounds();
    _.each( this.matchingMapLocations.models, function (loc) {
      var marker;
      if( loc.get('distance') > -1 ) {
        point= this.gmaps.latLng( loc.get('latitude'), loc.get('longitude') );
        marker= this.gmaps.marker({
          position:point,
          map:map
        });
        this.gmaps.addListener(marker, 'click', function () {
          var $link= $('<a class="map-link"/>')
            .text( loc.get('name') + ' ('+ loc.get('abbreviation') +')' )
            .data('locationId', loc.get('id'));
          infoWindow.setOptions({ content : $link.get(0) });
          infoWindow.open(map, marker);
        });
        bounds.extend(point);
        markers.push(marker);
      }
    }, this);
    if( markers.length == 1 ) {
      map.setCenter(point);
      map.setZoom(17);
    } else if( markers.length > 0 ) {
      this.map.fitBounds(bounds);
    }
    this.markers= markers;
  },

  clickLocation : function (e) {
    e.preventDefault();
    this.trigger('clickLocation', $(e.target).data('locationId') );
  },
  
  show : function () {
    this.$el.show();
    this.isVisible= true;
  },
  
  hide : function () {
    this.$el.hide();
    this.isVisible= false;
  }
  
});