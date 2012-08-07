//http://stackoverflow.com/questions/9781102/backbone-multiple-collections-fetch-from-a-single-big-json-file
MapLocation= Backbone.Model.extend({
  
  getCoords : function () {
    var lat= this.get('latitude'),
        lon= this.get('longitude');
    return lat != null && lon != null && { latitude : lat, longitude : lon }
  }
  
});