MatchingMapLocations= Backbone.Collection.extend({
  model: MapLocation,
  defaultLocation : { latitude:1, longitude:2 },
  
  initialize : function () {
    this.on('reset', this.calculateDistances, this);
  },
  
  /* 
    comparator()
    Always sort by distance. 
  */
  comparator : function (model) {
    return model.get('distance');
  },
  
  calculateDistances : function () {
    var coords, dist, collection= this;
    this.models.forEach( function (model) {
      coords= model.getCoords();
      dist= coords ? collection.calculateDistance( collection.defaultLocation, model.getCoords() ) : -1;
      model.set('distance', dist );
    });
    // Resort now that location is defined. This MUST be silent, or you will cause an infinite loop.
    this.sort({silent:true});
  },
  
  calculateDistance : function (coord1, coord2) {
    var lat1 = this.convertDegToRad(coord1.latitude),
        lon1 = this.convertDegToRad(coord1.longitude),
        lat2 = this.convertDegToRad(coord2.latitude),
        lon2 = this.convertDegToRad(coord2.longitude),
  
        R = 6371, // km
        dLat = lat2-lat1,
        dLon = lon2-lon1,
        a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },


  convertDegToRad : function (number) {
    return number * Math.PI / 180;
  }
  
});