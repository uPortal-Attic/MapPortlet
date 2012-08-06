// http://stackoverflow.com/questions/9781102/backbone-multiple-collections-fetch-from-a-single-big-json-file
MapLocations= Backbone.Collection.extend({
  model : MapLocation,
  url : '../../data/map-new.json',
  model : MapLocation,
  defaultLocation : {},
  
  parse : function (response) {
    console.log('MapLocations.parse()');
    this.defaultLocation= response.mapData.defaultLocation;
    return response.mapData.locations;
  }
});