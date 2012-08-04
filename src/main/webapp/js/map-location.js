http://stackoverflow.com/questions/9781102/backbone-multiple-collections-fetch-from-a-single-big-json-file
MapLocation= Backbone.Model.extend({
  url: '../../data/map-new.json',
  
  initialize : function () {
    this.defaultLocation= new DefaultLocation();
    this.locations= new MapLocations();
    
  }
});