MapLocations= Backbone.Collection.extend({
  model : MapLocation,
  
  defaultLocation : {},
  
  initialize : function (options) {
    this.url= options.url;
  },
  
  parse : function (response) {
    var index= 0, categories= {};
    this.defaultLocation= response.mapData.defaultLocation;
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
    return response.mapData.locations;
  },
  
  findById : function (id) {
    var id= parseInt(id, 10);
    return this.find( function (model) {
      return model.get('id') === id;
    });
  }
  
});


