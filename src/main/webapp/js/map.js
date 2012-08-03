MapPortletRouter= Backbone.Router.extend({
  routes: {
    '': 'home'
  },
  
  home : function () {
    var view= Backbone.View.extend({});
    view.render();
  }
  
});

