MapSearchContainerView= Backbone.View.extend({
  template: '#map-search-container-template',
  className: 'map-search-container',
  
  events : {
    'click a.map-browse-link' : 'clickBrowse',
    'click input[type=submit]' : 'submitSearch'
  },
  
  initialize : function (options) {
    this.mapLocations= options.mapLocations;
    this.mapLocations.fetch();
    this.matchingMapLocations= options.matchingMapLocations;
  },
  
  clickBrowse : function (e) {
    console.log('MapSearchContainerView.clickBrowse()');
    this.trigger('clickBrowse');
  },
  
  submitSearch : function (e){
    // do search
    var ff= $(e.target).closest('form').get(0).search;
    console.log('1. form submit.');
    this.search(ff.value);
  },
  
  search : function (query) {
    console.log('2. search() query:', query);
    var matches;
    if( query ) {
      this.matchingMapLocations.defaultLocation= this.mapLocations.defaultLocation;
      query= query.toLowerCase(query);
      matches= _.filter( this.mapLocations.models, function (location) {
        return location.get('searchText') && location.get('searchText').indexOf(query) > -1;
      });
      this.matchingMapLocations.reset(matches);
      console.log('3. matching locations:', this.matchingMapLocations.length);
    }
  },
  
  filterByCategory : function (category) {
    console.log('MapSearchContainerView.filterByCategory() cat:', category);
    var matches;
    if( category ) {
      matches= _.filter( this.mapLocations.models, function (location) {
        return location.get('categories') && _.indexOf( location.get('categories'), category ) > -1;
      });
      this.matchingMapLocations.reset(matches);
      console.log('reset with '+matches.length+' locations.');
    }
  }
  
});