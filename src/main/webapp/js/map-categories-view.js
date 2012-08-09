MapCategoriesView= Backbone.View.extend({
  template : '#map-categories-template',
  className : 'map-categories',
  categories : {},
  
  events : {
    'click a.map-category-link' : 'clickCategory'
  },
  
  initialize : function (options) {
    var self= this;
    this.mapLocations= options.mapLocations;
    this.mapLocations.on( 'reset', this.updateMapLocationCatgories, this );
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
  
  clickCategory : function (e) {
    console.log('MapCategoriesView.clickCategory()', $(e.target).data('category'));
    this.trigger('clickCategory', $(e.target).data('category') );
  },
  
  serialize : function () {
    return { categories : this.categories || {} };
  }
  
});
/*
{"latitude":41.3117073,"longitude":-72.9255341,"name":"Commons","abbreviation":"UC","address":"168 Grove Street New Haven, CT 06511","description":null,"img":"http://business.yale.edu/map/thumbnail/UC.jpg","searchText":"commons~uc~","searchKeys":[],"categories":["bookstore","dorm"],"campuses":["Main"]},
  */    