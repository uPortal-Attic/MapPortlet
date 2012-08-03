MapView= Backbone.View.extend({
  template: '#N_map-view-template',
  className: 'portlet',
  /*
  initialize: function () {
    console.log('MapView.initialize()', $('#N_map-template'));
    //_.bindAll(this, 'render');
    this.template= _.template( $('#N_map-view-template').html() );
  },
  */
  render: function (manage) {
    //$(this.el).html( this.template({}) );
    var r= manage(this).render();
    console.log('MapView.render()', r );
    return r;
  }
});