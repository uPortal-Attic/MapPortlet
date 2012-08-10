MapCategoryDetailView = Backbone.View.extend({
  template : '#map-category-detail-template',
  events : {
    'click a.map-category-back-link' : 'clickBack'
  },
  
  clickBack : function (e) {
    this.trigger('clickBack');
  }
});