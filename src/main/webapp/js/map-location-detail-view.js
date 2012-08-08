MapLocationDetailView= Backbone.View.extend({
  template : '#map-location-detail-template',
  className : 'map-location-detail portlet',
  model : new MapLocation(),
  
  events : {
    'click .map-location-back-link' : 'returnToSearchResults',
    'click .map-location-map-link' : 'showLocationMap'
  },
  
  initialize : function (options) {
    console.log('MapLocationDetailView.initialize()');
    this.matchingMapLocations= options.matchingMapLocations;
    this.model.on('change', this.render, this);
  },
  
  serialize : function () {
    return { location : this.model ? this.model.toJSON() : {} };
  },
  
  returnToSearchResults : function () {
    console.log('MapLocationDetailView.returnToSearchResults()');
    this.trigger('returnToSearchResults');
  },
  
  showLocationMap : function () {
    console.log('MapLocationDetailView.showLocationMap() model:', this.model);
    this.matchingMapLocations.reset(this.model);
    this.matchingMapLocations.trigger('one');
  },
  
  render : function (manage) {
    console.log('MapLocationDetailView.render() model:', this.model);
    return manage(this).render();
  }

});