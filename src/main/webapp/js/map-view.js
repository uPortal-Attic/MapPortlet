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
  
  createMap : function () {
    var coords, self= this;
    if( ! this.map ) {
      if( ! this.isVisible ) return false;
      coords= this.mapLocations.defaultLocation;
      latLng= new window.google.maps.LatLng(coords.latitude, coords.longitude);
      /*
      TODO: how to make this dynamic
       *
      var mapOptions = {
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
        
      };*/
      this.mapOptions.center= latLng;
      this.map= new google.maps.Map( $('.map-display', this.$el).get(0), this.mapOptions );
      this.infoWindow= new google.maps.InfoWindow();
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
    bounds= new window.google.maps.LatLngBounds();
    _.each( this.matchingMapLocations.models, function (loc) {
      var marker;
      if( loc.get('distance') > -1 ) {
        point= new window.google.maps.LatLng( loc.get('latitude'), loc.get('longitude') );
        marker= new google.maps.Marker({
          position:point,
          map:map
        });
        google.maps.event.addListener(marker, 'click', function () {
          var $link= $('<a class="map-link"/>')
            .text( loc.get('name') + ' ('+ loc.get('abbreviation') +')' )
            .data('locationId', loc.get('id'));
          infoWindow.setOptions({ content : $link.get(0) });
          infoWindow.open(map, marker);
        });
        bounds.extend(point);
        markers.push(marker);
      }
    });
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