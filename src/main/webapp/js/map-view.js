MapView= Backbone.View.extend({
  template: '#N_map-view-template',
  className: 'portlet',

  initialize: function () {
    console.log('MapView.initilize()');
    console.log(this.collection);
    //this.collection= collection;
  },

  render: function (manage) {
    console.log('MapView.render()', this.$el);
    return manage(this).render();
  }
});