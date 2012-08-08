// http://stackoverflow.com/questions/9781102/backbone-multiple-collections-fetch-from-a-single-big-json-file
MapLocations= Backbone.Collection.extend({
  model : MapLocation,
  url : '../../data/map-new.json',
  model : MapLocation,
  defaultLocation : {},
  
  parse : function (response) {
    console.log('MapLocations.parse()');
    this.defaultLocation= response.mapData.defaultLocation;
    this.addIds( response.mapData.locations );
    return response.mapData.locations;
  },
  
  addIds : function (locations) {
    var index= 0;
    _.each(locations, function (l) {
      l.id= index;
      index += 1;
    });
  }
});