MapCategoriesView= Backbone.View.extend({
  template : '#map-categories-template',
  className : 'map-categories',
  categories : {},
  
  initialize : function (options) {
    this.mapLocations= options.mapLocations;
    this.mapLocations.on( 'reset', this.updateMapLocationCatgories, this );
    var self= this;
    this.mapLocations.fetch().then( function (xhr) { self.updateMapLocationCategories() } );
  },
  
  updateMapLocationCategories : function () {
    console.log('+MapCategoriesView.updateMapLocationCategories()');
    var self= this;
    this.categories= {};
    this.mapLocations.forEach( function (location) {
      if( location.has('categories') ) {
        _.each( location.get('categories'), function (c) {
          if( ! self.categories.hasOwnProperty(c) ) self.categories[c]=0;
          self.categories[c] += 1;
        });
      }
    });
    this.render();
  },
  
  serialize : function () {
    return { categories : this.categories || {} };
  }
  
});
/*
{"latitude":41.3117073,"longitude":-72.9255341,"name":"Commons","abbreviation":"UC","address":"168 Grove Street New Haven, CT 06511","description":null,"img":"http://business.yale.edu/map/thumbnail/UC.jpg","searchText":"commons~uc~","searchKeys":[],"categories":["bookstore","dorm"],"campuses":["Main"]},
  */    