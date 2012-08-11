MapCategoryDetailView = Backbone.View.extend({
  template : '#map-category-detail-template',
  events : {
    'click a.map-category-back-link' : 'clickBack',
    'click a.map-location-link' : 'clickLocation'
  },
  
  initialize : function (options) {
    this.matchingMapLocations= options.matchingMapLocations;
  },
  
  clickBack : function (e) {
    this.trigger('clickBack');
  },
  
  clickLocation : function (e) {
    var id= $(e.target).data('locationid');
    console.log( $(e.target).eq(0), id);
    this.trigger('clickLocation', id);
  },
  
  serialize : function () {
    return { locations : this.matchingMapLocations };
  },
  
  render : function (manage) {
    console.log('+MapCatagoryDetailView render()');
    return manage(this).render();
  }
});