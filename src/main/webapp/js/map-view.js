MapView= Backbone.View.extend({
  template: '#N_map-view-template',
  className: 'portlet',

  initialize: function (options) {
    console.log('MapView.initilize()');
    this.matchingMapLocations= options.matchingMapLocations;
    this.matchingMapLocations.on('reset', function () {console.log("\n\nRENDER MAP!\n\n")});
  },

  render: function (manage) {
    console.log('MapView.render()', this.$el);
    return manage(this).render();
  }
});