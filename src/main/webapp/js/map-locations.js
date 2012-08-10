// http://stackoverflow.com/questions/9781102/backbone-multiple-collections-fetch-from-a-single-big-json-file
MapLocations= Backbone.Collection.extend({
  model : MapLocation,
  url : '../../data/map-new.json',
  model : MapLocation,
  defaultLocation : {},
  
  initialize : function () { console.log('+ mapLocations INIT'); },
  
  parse : function (response) {
    console.log('MapLocations.parse()');
    var index= 0, categories= {};
    this.defaultLocation= response.mapData.defaultLocation;
    //this.addIds( response.mapData.locations );
    _.each(response.mapData.locations, function (location) {
      // add id
      location.id= index;
      index += 1;
      // group categories
      if( location.categories ) {
        _.each( location.categories, function (category) {
          if( ! categories.hasOwnProperty(category) ) categories[category]=0;
          categories[category] += 1;
        });
      }
    });
    this.categories= categories;
    console.log('++ categories', categories);
    return response.mapData.locations;
  },
  
  findById : function (id) {
    var id= parseInt(id, 10);
    return this.find( function (model) {
      return model.get('id') === id;
    });
  }
  
});


