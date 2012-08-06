MapSearchContainerView= Backbone.View.extend({
  template: '#map-search-container-template',
  className: 'map-search-container',
  
  events : {
    'click input[type=submit]' : 'onSubmitSearch'
  },
  
  initialize : function () {
    this.locations= new MapLocations();
    this.locations.fetch();
    this.matchingMapLocations= new MatchingMapLocations();
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
      matchingLocations= _.filter( this.locations.models, function (location) {
        return location.get('searchText') && location.get('searchText').indexOf(query) > -1;
      });
      console.log('3. matching locations:', matchingLocations.length);
      //fire
    }
  },

  render : function (manage) {
    console.log('MapSearchContainerView.render()');
    //console.log( $('#map-container', this.$el) );
    //console.log(this.locations);
    this.setView( '#map-container', new MapView({collection:this.matchingMapLocations}));
    r=manage(this).render();
    return r;
  }
});