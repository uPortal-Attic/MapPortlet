MapCategoriesView= Backbone.View.extend({
  template : '#map-categories-template',
  className : 'map-categories',
  categories : {},
  
  events : {
    'click a.map-search-link' : 'returnToHome',
    'click a.map-category-link' : 'clickCategory'
  },
  
  initialize : function (options) {
    this.mapLocations= options.mapLocations;
    this.mapLocations.on('reset', this.render, this);
  },

  returnToHome : function () {
    this.trigger('returnToHome');
  },
  
  clickCategory : function (e) {
    this.trigger('clickCategory', $(e.target).data('category') );
  },
  
  serialize : function () {
    return { categories : this.mapLocations.categories || {} };
  }
  
});