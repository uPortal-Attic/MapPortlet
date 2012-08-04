MapSearchContainerView= Backbone.View.extend({
  template: '#map-search-container-template',
  className: 'map-search-container',
  
  events : {
    'click input[type=submit]' : 'onSubmitSearch'
  },
  
  initialize : function () {
    this.locations= new MapLocations();
    this.locations.fetch();
  },
  
  onSubmitSearch : function (e){
    // do search
    var ff= $(e.target).closest('form').get(0).search;
    console.log('1. form submit.');
    this.search(ff.value);
  },
  
  search : function (query) {
    console.log('2. search() query:', query);
    this.matchingLocations= [];
    if( query ) {
      query= query.toLowerCase(query);
      console.log('locations:', this.locations);
    }
  }
});