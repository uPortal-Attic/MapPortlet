MapLocationDetailView= Backbone.View.extend({
  initialize : function () {
    console.log('MapLocationDetailView');
  },
  
  render : function (manage) {
    console.log('MapLocationDetailView.render() model:', this.model);
    return manage(this).render();
  }
});