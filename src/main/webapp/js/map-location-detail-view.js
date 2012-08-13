MapLocationDetailView= Backbone.View.extend({
  template : '#map-location-detail-template',
  className : 'map-location-detail portlet',
  model : new MapLocation(),
  
  events : {
    'click .map-location-back-link' : 'returnToSearchResults',
    'click .map-location-map-link' : 'clickLocation'
  },
  
  initialize : function (options) {
    this.matchingMapLocations= options.matchingMapLocations;
    this.model.on('change', this.render, this);
  },
  
  serialize : function () {
    return { location : this.model ? this.model.toJSON() : {} };
  },
  
  returnToSearchResults : function () {
    this.trigger('returnToSearchResults');
  },

  clickLocation : function () {
    this.matchingMapLocations.reset(this.model);
    this.trigger('clickLocation', this.model.get('id'));
  }

});