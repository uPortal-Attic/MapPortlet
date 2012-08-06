MapSearchContainerView= Backbone.View.extend({
  template: '#map-search-container-template',
  className: 'map-search-container',
  
  events : {
    'click input[type=submit]' : 'onSubmitSearch'
  },
  
  initialize : function (options) {
    this.mapLocations= options.mapLocations;
    this.mapLocations.fetch();
    this.matchingMapLocations= options.matchingMapLocations;
    
    //this.matchingMapLocations.on('reset', function () {console.log("\n\nSUCKERS!\n")});
  },
  
  onSubmitSearch : function (e){
    // do search
    var ff= $(e.target).closest('form').get(0).search;
    console.log('1. form submit.');
    this.search(ff.value);
  },
  
  search : function (query) {
    console.log('2. search() query:', query);
    if( query ) {
      query= query.toLowerCase(query);
      matches= _.filter( this.mapLocations.models, function (location) {
        return location.get('searchText') && location.get('searchText').indexOf(query) > -1;
      });
      this.matchingMapLocations.reset(matches);
      console.log('3. matching locations:', this.matchingMapLocations.length);
      //fire
    }
  },

  render : function (manage) {
    console.log('MapSearchContainerView.render()');
    //console.log( $('#map-container', this.$el) );
    //console.log(this.mapLocations);
    //this.setView( '#map-container', new MapView({collection:this.matchingMapLocations}));
    r=manage(this).render();
    return r;
  }
});