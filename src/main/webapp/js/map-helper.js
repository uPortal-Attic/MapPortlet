/*
 * Licensed to Jasig under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Jasig licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var map = map || {};

if (!map.init) {
    map.init = function ($, fluid, google) {
        
        fluid.defaults("map.CampusMap", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            defaultCoordinates: {
                latitude: 0,
                longitude: 0
            },
            location: null,
            mapDataUrl: null,
            includeAbbreviation: true,
            mapOptions: {},
            selectors: {
                searchContainer: ".map-search-container",
                mapContainer: ".map-container",
                categoriesContainer: ".map-categories",
                locationDetailContainer: ".map-location-detail"
            },
            events: {
                onReady: null,
                onUpdateSearchResults: null,
                onCategorySelect: null,
                onLocationSelect: null,
                onLocationMapView: null,
                onShowSearchView: null,
                onShowCategoriesView: null,
				onShowCampusesView: null,
				updateSearch: {
					event : "onUpdateSearchResults",
					args: [ "{CampusMap}" ] 
				},
                showSearch: {
                    event: "onShowSearchView",
                    args: [ "{CampusMap}" ]
                },
                showLocationMap: {
                    event: "onLocationMapView",
                    args: [ "{CampusMap}" ]
                },
                showLocationDetails: {
                    event: "onLocationSelect",
                    args: [ "{CampusMap}" ]
                },
                showCategories: {
                    event: "onShowCategoriesView",
                    args: [ "{CampusMap}" ]
                },
				showCampuses: {
                    event: "onShowCampusesView",
                    args: [ "{CampusMap}" ]
                },
                showCategoryDetails: {
                    event: "onCategorySelect",
                    args: [ "{CampusMap}" ]
                }
            },
            listeners: {
			    //hides the search box, shows the button to reveal it again
				updateSearch: function(that){
					that.hideSearch();
				},
				// shows the search box
                showSearch: function(that) {
                    that.showSearch();
                    that.locate("mapContainer").show();
                    that.locate("categoriesContainer").hide();
					$(".portlet-wrapper-titlebar").show();
					that.locate("locationDetailContainer").hide();
                }, // show a location
                showLocationMap: function(that) {
					that.model.recenter=false;
					that.model.clearMarkers=false;
                    that.showSearch();
                    $(".portlet-wrapper-titlebar").show();
					$("#global_title").text('');
					$('#locate_me_holder').show();
                    that.locate("mapContainer").show();
                    that.locate("categoriesContainer").hide();
					that.locate("locationDetailContainer").hide();
                }, //leave the map and show address details of a chosen pin
                showLocationDetails: function(that) {
					$("#titleShowSearch").hide();
					$(".map #map-info").hide();
					$("#global_title").text('');
                    $(".portlet-wrapper-titlebar").show();
					$('#locate_me_holder').hide();
                    that.locate("searchContainer").hide();
                    that.locate("mapContainer").hide();
                    that.locate("categoriesContainer").hide();
                }, // leave the map and show a list of categories
                showCategories: function(that) {
					that.MapView.calculateVisibleAndPossibleLocationsByCategory();
                	$('#locate_me_holder').hide();
					that.model.recenter=false;
					that.model.clearMarkers=true;
                    $("#titleShowSearch").hide();
                    $(".portlet-wrapper-titlebar").show();
					that.locate("searchContainer").hide();
                    that.locate("mapContainer").hide();
                    that.locate("categoriesContainer").show();
					$("#global_title").text('Categories');
					$(".map #map-info").hide();
					that.locate("locationDetailContainer").hide();
                },// leave the map and show a list of campuses
				showCampuses: function(that) {
					$('#locate_me_holder').hide();
					that.model.recenter=true;
					that.model.clearMarkers=true;
                    $("#titleShowSearch").hide();
                    $(".portlet-wrapper-titlebar").show();
					that.locate("searchContainer").hide();
                    that.locate("mapContainer").hide();
                    that.locate("categoriesContainer").show();
					$("#global_title").text('Campuses');
					$(".map #map-info").hide();
					that.locate("locationDetailContainer").hide();
                }, // return to the map and show the markers corresponding to the chosen category/campus
                showCategoryDetails: function(that) {
                    that.showSearch();
					$('#locate_me_holder').show();
                    $(".portlet-wrapper-titlebar").show();
					$("#global_title").text('');
					$(".map #map-info").show();
                    that.locate("mapContainer").show();
                    that.locate("categoriesContainer").hide();
                    that.locate("locationDetailContainer").hide();
                }
            },
            components: {
                MapView: {
                    type: "map.MapView",
                    createOnEvent: "onReady",
                    container: "{CampusMap}.dom.mapContainer",
                    options: {
                        model: "{CampusMap}.model",
                        mapOptions: "{CampusMap}.options.mapOptions",
                        defaultCoordinates: "{CampusMap}.options.defaultCoordinates",
                        events: {
                            onUpdateSearchResults: "{CampusMap}.events.onUpdateSearchResults",
                            onCategorySelect: "{CampusMap}.events.onCategorySelect",
                            onLocationMapView: "{CampusMap}.events.onLocationMapView",
                            onLocationSelect: "{CampusMap}.events.onLocationSelect",
							onShowCategoriesView: "{CampusMap}.events.onShowCategoriesView",
							onShowCampusesView: "{CampusMap}.events.onShowCampusesView"
                        }
                    }
                },
                CategoriesView: {
                    type: "map.CategoriesView",
                    createOnEvent: "onReady",
                    container: "{CampusMap}.dom.categoriesContainer",
                    options: {
                        model: "{CampusMap}.model",
                        events: {
                            onCategorySelect: "{CampusMap}.events.onCategorySelect",
							onShowCategoriesView: "{CampusMap}.events.onShowCategoriesView",
							onShowCampusesView: "{CampusMap}.events.onShowCampusesView"
                        }
                    }
                },
                SearchView: {
                    type: "map.SearchView",
                    createOnEvent: "onReady",
                    container: "{CampusMap}.dom.searchContainer",
                    options: {
                        model: "{CampusMap}.model",
                        events: {
                            onUpdateSearchResults: "{CampusMap}.events.onUpdateSearchResults",
							onCategorySelect: "{CampusMap}.events.onCategorySelect",
							onLocationMapView: "{CampusMap}.events.onLocationMapView"
                        }
                    }
                },
                LocationDetailView: {
                    type: "map.LocationDetailView",
                    createOnEvent: "onReady",
                    container: "{CampusMap}.dom.locationDetailContainer",
                    options: {
                        model: "{CampusMap}.model",
                        events: {
                            onLocationSelect: "{CampusMap}.events.onLocationSelect",
                            onShowCategoriesView: "{CampusMap}.events.onShowCategoriesView",
							onShowCampusesView: "{CampusMap}.events.onShowCampusesView",
                            onLocationMapView: "{CampusMap}.events.onLocationMapView"
                        }
                    }
                }
            },
            finalInitFunction: function(that) {
				that.showSearch=function(){
					that.locate("searchContainer").show();
					$("#titleShowSearch").hide();
				};
				
				that.makeShowSearch=function() {
					that.SearchView.showSearch = that.showSearch;
				}
				
				that.makeHideSearch=function() {
					that.SearchView.hideSearch = that.hideSearch;
				}
				
				that.hideSearch=function(){
                    var css = that.locate("searchContainer").css('position');
                    /*only hide search on mobile view*/
                    if(css.indexOf('absolute')!=-1) {
						that.locate("searchContainer").hide();
						$("#titleShowSearch").show();
					}
				};
				$('.map-display-link').on('click',function(){
					that.events.onLocationMapView.fire();
				});
				that.hasStorage=false;
				if(typeof(Storage)!=="undefined"){
					that.hasStorage=true;
				}
				that.modelRefreshDatesMatch = function(){
					return that.hasStorage && localStorage.getItem("mapdatarefreshdate")!=='undefined' &&
					localStorage.getItem("mapdatarefreshdate")!==null && that.options.mapOptions.mapdatarefreshdate===localStorage.getItem("mapdatarefreshdate"); 
				}
				that.hasStoredModelData = function() {
					return that.hasStorage && localStorage.getItem("mapdata");
				}
				if(that.modelRefreshDatesMatch() && that.hasStoredModelData()) {
					that.model = JSON.parse(localStorage.getItem("mapdata"));
					/*At this point the components of this one instantiate their objects*/
					that.events.onReady.fire();
					that.makeShowSearch();
					that.makeHideSearch();
					that.MapView.refreshView();
				}
				else {
					$.get(
						that.options.mapDataUrl, 
						function(json) {
							that.model = json.mapData;
							that.model.categories = [];
							that.model.campuses = [];
							$(that.model.locations).each(function (idx, location) {
								$(location.categories).each(function (idx, category) {
									if (!that.model.categories[category]) {
										that.model.categories.push({ name: category, locations: [] });
										that.model.categories[category] = that.model.categories[that.model.categories.length-1];
									}
									that.model.categories[category].locations.push(location);
								});
								// treat campuses as just another category
								 $(location.campuses).each(function (idx, campus) {
									if (!that.model.categories[campus]) {
										that.model.categories.push({ name: campus, locations: [] });
										that.model.categories[campus] = that.model.categories[that.model.categories.length-1];
									}
									// a convenience array of campus names
									if(!that.model.campuses[campus]){
										that.model.campuses.push(campus);
										that.model.campuses[campus] = that.model.campuses[that.model.campuses.length-1];
									}
									that.model.categories[campus].locations.push(location);
								});
							});
                            that.model.matchingLocations = [];
                            that.model.allLocations = [];
							that.model.categories.push({ name: 'ALL', locations: that.model.allLocations });
							/*At this point the fluid components of this one instantiate their objects*/
							that.events.onReady.fire();
							that.makeShowSearch();
							that.makeHideSearch();

							$(that.model.locations).each(function (idx, location) {
								that.model.matchingLocations.push(location);
								that.model.allLocations.push(location);
							});
							that.model.allCategories = {name:'ALL'};
							that.model.category = that.model.allCategories;
							if(that.hasStorage) {
                                /*Note - do not try to stringify the model once it has googlemaps marker objects attached,
                                 you will get circular data structure errors*/
								localStorage.setItem("mapdata", JSON.stringify(that.model));
								//we will not update the stored model data until this value changes
								localStorage.setItem('mapdatarefreshdate',that.options.mapOptions.mapdatarefreshdate);
							}
							that.MapView.refreshView();
						}, 
						"json"
					);
				}
			    $("#Locate_me").click(
					 function(){
					 $.blockUI({ message: '<h1> Looking up your location...</h1>', css: {width: '70%', left: '10%',right: '10%',padding: '15px', border: 'none',backgroundColor: '#000', '-webkit-border-radius': '10px', '-moz-border-radius': '10px', opacity: .5, color: '#fff' } });
					 that.MapView.map.getCurrentPosition(function(position, status) {
								if ( status === 'OK' ) {
									 $(".map #map-info").show();
									 $(".map #map-info .title").text("Your location");
									$.unblockUI();
									var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
									var styled = new StyledMarker({styleIcon:new StyledIcon(StyledIconTypes.MARKER,{color:"00BFFF",text:''}),position:clientPosition,map: that.MapView.map.get('map')});
									styled.setZIndex(1000);
									that.MapView.map.addShape( 'Circle', { 
										'strokeWeight': 0, 
										'fillColor': "#00BFFF", 
										'fillOpacity': 0.2, 
										'zIndex: ': 10,
										'center': clientPosition, 
										'radius': 10, 
										'clickable': false
									});
									that.MapView.map.option('center', clientPosition);
									that.events.onLocationMapView.fire();
							}
					},{maximumAge:Infinity} );
				}
			 );
            }
        });
        
        /**
         * Search form view component
         */
        fluid.defaults("map.SearchView", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            selectors: {
                mapSearchForm: ".map-search-form",
                mapSearchInput: ".map-search-input",
                mapSearchResults: ".map-search-results",
                mapLink: ".map-search-map-link",
                listLink: ".map-search-list-link"
            },
            events: {
                onUpdateSearchResults: null,
				onCategorySelect: null,
				onLocationMapView : null,
				onShowCategory: {
                    event: "onCategorySelect",
                    args: [ "{SearchView}" ]
                },
				onShowLocation: {
                    event: "onLocationMapView",
                    args: [ "{SearchView}" ]
                }
				
            },
			  listeners: {
                onShowCategory: function(that) {
					that.adjustSearchBoxPosition ();
					that.fadeMapInfo();
				},
				onShowLocation: function(that) {
					that.adjustSearchBoxPosition();
					that.fadeMapInfo();
                }
            },
            finalInitFunction: function (that) {
			     that.adjustSearchBoxPosition = function(){
					if(that.mapInfoFaded() && $(".map #map-info").is(':visible')) {
						$('.map-search-container').animate({top:'+=40'}, 0);
						$(".map #map-info").removeClass('faded');
					}
				 }
				//titleShowSearch is outwith the FLUID bound map dom so we need to access it directly without using a FLUID selector.
				$("#titleShowSearch").on('click',function(){
					that.showSearch();
					$(this).hide();
				});
            	var availableSearchData =[];
                that.search = function(query) {
                    
                    if (query) {
                        // check each location to see if it matches our search string
                        query = query.toLowerCase();
                        if (query) {
                            $(that.model.locations).each(function (idx, location) {
								if(location.name) {
                                   if (location.name.toLowerCase()===query) {
									   that.model.location=location;
                                   }
								}
                            });
                        }
                    }
					
					$(".map #map-info").hide();
                    that.events.onUpdateSearchResults.fire();
                };
                
                $(that.model.locations).each(function (idx, location) {
					if(location.name &&!availableSearchData[location.name] ) {
					   availableSearchData.push(location.name);
					   availableSearchData[location.name] = availableSearchData[availableSearchData.length-1];
					}
					else if(location.address){
					   availableSearchData.push(location.address);
					   availableSearchData[location.address] = availableSearchData[availableSearchData.length-1];
					}
                });
				
                $(".map-search-input").autocomplete({
          		  source: availableSearchData,
				  minLength: 3
          		});
				// when the search input is cleared it retains focus - this allows the user to take focus away again
				// by either tapping or moving the map.
				$(".map-container").on({
					click:function(){
						$(".map-search-input").blur();
						that.fadeInfoMoveSearchUp(2000,0);
						that.hideSearch();
						$("#titleShowSearch").show();
						return true;
					},
					mousemove: function(){
						$(".map-search-input").blur();
						that.fadeInfoMoveSearchUp(2000,2000);
					}
				});
				that.mapInfoFaded = function (){
					if($(".map #map-info").attr('class')) {
						return $(".map #map-info").attr('class').indexOf('faded')!=-1;
					}
					return false;
				}
				that.fadeInfoMoveSearchUp = function(durationFade, durationMove){
					if(that.mapInfoFaded()===false && $.mobile) {
						$(".map #map-info").fadeOut(durationFade);
						$(".map #map-info").addClass('faded');
						$('.map-search-container').animate({top: '-=40'}, durationMove);
					}
				};
				that.fadeMapInfo = function(){
						setTimeout(function(){
							that.fadeInfoMoveSearchUp(2000,2000);
						},3000);
				}
				that.fadeMapInfo();
				
				//search as soon as user chooses a value from the autocomplete list
				that.locate("mapSearchInput").on('autocompleteselect',function (event,ui) {
					that.search(ui.item.value); 
					$(".map-search-input").blur();
                    return false;  
                } );
				$(that.options.selectors.mapSearchForm).live('submit', function () {
                    $( "#search-dialog-modal" ).dialog({
						height: 140,
						modal: true,
						buttons: {
						"OK": function() {
						  $( this ).dialog( "close" );
						}
					  }
					}); 
					$(".map-search-input").blur();
                    return false; 
                });
            }
        });
        
        /**
         * Category list view component - contains categories and campuses
         */
        fluid.defaults("map.CategoriesView", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            renderOnInit: true,
            selectors: {
                category: ".map-category",
                categoryLink: ".map-category-link",
                mapLink: ".map-search-map-link",
                listLink: ".map-search-list-link"
            },
            events: {
				onShowCategoriesView: null,
				onShowCampusesView: null,
				onShowCategories: {
                    event: "onShowCategoriesView",
                    args: [ "{CategoriesView}" ]
                },
				onShowCampuses: {
                    event: "onShowCampusesView",
                    args: [ "{CategoriesView}" ]
                }
            },	
			listeners: {
                onShowCategories: function(that) {
					that.showCategories();
					$('.map-category-link:visible').each(function(idx,element){
						var catText = element.text.replace(' (off-map)','');
						var category = that.model.getCategoryByName(catText);
						if(category.numMatching===0){
							$(this).text(element.text.replace(' (off-map)',''));
							$(this).addClass("ui-disabled");
						}
						else if(category.numVisible===0){
							$(this).removeClass("ui-disabled");
							if(element.text.indexOf(' (off-map)')==-1){
								$(this).text(element.text +' (off-map)');
							}
							
						}
						else {
							$(this).removeClass("ui-disabled");
							$(this).text(element.text.replace(' (off-map)',''));
							$(this).css({background:'none'});
						}
					});
                },
				onShowCampuses:  function(that) {
					that.showCampuses();
                }
            },
            repeatingSelectors: [ "category" ],
            // renderer proto-tree defining how data should be bound
            protoTree: {
                expander: {
                    type: "fluid.renderer.repeat",
                    repeatID: "category",
                    controlledBy: "categories",
                    pathAs: "category",
                    tree: {
                        categoryLink: { value: "${{category}.name}", target: "javascript:;" }
                    }
                }
            },
            finalInitFunction: function(that) {
				var campusChosen = false;
				that.showCategories = function() {
					toggleCategoriesAndCampuses(false);
				};
				that.showCampuses = function () {
					toggleCategoriesAndCampuses(true);
				};
				var toggleCategoriesAndCampuses = function(showCampus) {
					campusChosen=showCampus;
					var displayElements = $(".map-category");
					if(showCampus) {
						displayElements.hide();
					} else {
						displayElements.show();
					}
				    $(that.model.campuses).each(
				        function (idx, campus) {
								if(showCampus) {
									$(".map-category").filter(":contains('"+campus+"')").show();
								}
								else {
									$(".map-category").filter(":contains('"+campus+"')").hide();
								}
					});
					
				};
                that.model.getCategoryByName = function(name){
					var found;
					$(this.categories).each(
						function(idx,category) {
						  if(category.name.toLowerCase()===name.toLowerCase()){
							found= category;
							return false;
						  }
					  }
					);
					return found;
				}
                that.locate("categoryLink").on("click", function () {
                    var link = $(this);
					var categoryName=link.html().toLowerCase().replace(' (off-map)','');
					
                    that.model.category = that.model.getCategoryByName(categoryName);
					if(campusChosen) {
						that.model.campus=that.model.category;
						/*resetting the displayed locations 'type' to be 'All'*/
						that.model.matchingLocations = that.model.getCategoryByName('ALL').locations;
					}
					else {
						that.model.matchingLocations = that.model.category.locations;
					}

                    that.container.hide();
                    that.events.onCategorySelect.fire(that.model.category);
                });
            }
        });
        
        /**
         * Google Map view
         */
        fluid.defaults("map.MapView", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            selectors: {
                mapDisplay: ".map-display",
				mapCategoriesLink: ".map-categories-link",
				mapCampusesLink: ".map-campuses-link"
            },
            events: {
                onCategorySelect: null,
                onLocationMapView: null,
                onLocationSelect: null,
                onUpdateSearchResults: null,
                onShowCategoriesView: null,
				onShowCampusesView : null,
                onShowCategory: {
                    event: "onCategorySelect",
                    args: [ "{MapView}" ]
                },
                onShowLocation: {
                    event: "onLocationMapView",
                    args: [ "{MapView}" ]
                },
                onShowResults: {
                    event: "onUpdateSearchResults",
                    args: [ "{MapView}" ]
                }
            },
            listeners: {
                onShowCategory: function(that) {
					that.model.location=null;
					$(".map #map-info .title").text(that.model.category.name);
                    that.refreshView();
                },
                onShowResults: function(that) {
				    that.model.recenter=true;
					that.model.clearMarkers=true;
                    that.refreshView();
                },
                onShowLocation: function(that) {
					if(that.model.location) {
						that.model.matchingLocations = [ that.model.location ];
					}
                    that.refreshView();
                }
            },
            finalInitFunction: function(that) {
            	/**
                 * Get the distance in kilometers between two points.  This implementation
                 * uses a Javascript implementation of the Haversine formula provided at
                 * http://www.movable-type.co.uk/scripts/latlong.html.
                 */
                that.getDistance = function (point1, point2) {
                   var lat1 = degreesToRadians(point1.latitude);
                   var lon1 = degreesToRadians(point1.longitude);
                   var lat2 = degreesToRadians(point2.latitude);
                   var lon2 = degreesToRadians(point2.longitude);
                   
                   var R = 6371; // km
                   var dLat = lat2-lat1;
                   var dLon = lon2-lon1; 
                   var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                           Math.cos(lat1) * Math.cos(lat2) * 
                           Math.sin(dLon/2) * Math.sin(dLon/2); 
                   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                   var d = R * c;
                   return d;
               };
			   /* for each category, total a count of all locations that are visible and all that belong to the category visible or not.
			   Stores two values on each category - numVisible and numMatching. */
			   that.calculateVisibleAndPossibleLocationsByCategory = function(){
					// the map has no bounds until map.init() has completed
				   var bnd = that.map.get('map').getBounds();
				   if(bnd) {
                       $(that.model.categories).each(function (idx, category) {
                           numVisible = 0;
                           numMatching = 0;
                           $(category.locations).each(function (idx, location) {
                               numMatching++;
                               if (that.locationIsVisible(bnd, location)) {
                                   numVisible++;
                               }
                           });
                           category.numVisible = numVisible;
                           category.numMatching = numMatching;
                       });
					}
			    }
				that.locationIsVisible= function(bounds, location){
					var ne = bounds.getNorthEast();
				    var sw = bounds.getSouthWest();
					if (location.latitude >= sw.lat() && location.latitude <= ne.lat() &&
						location.longitude >= sw.lng() && location.longitude <= ne.lng()) { 
						return true;
					}
					else {
						return false;
					}
				}
                
              that.formatInfoAddress = function(address){
				if(address) {
	           		var addressParts = address.split(",");
	               	var formattedAddress;
	            	if(addressParts.length>3){
	               		formattedAddress = addressParts[0]+","+addressParts[1]+"<br>"+addressParts[2] + "," + addressParts[3];
	               	}
	            	else if(addressParts.length>2){
	               		formattedAddress = addressParts[0]+"<br>"+addressParts[1] + "," + addressParts[2];
	               	}
	               	else if(addressParts.length>1){
	               		formattedAddress = addressParts[0]+"<br>"+addressParts[1]
	               	}
	               	else {
	               		formattedAddress = addressParts[0];
	               	}
	               	return "<br>"+formattedAddress;
				}
				else {
					return "";
				}
             }
           
            that.refreshView = function() {
					that.closeInfoWindow();
					// if its a campus, or we are showing search results calculate 
	               // a new map center by taking an average lat/long of the markers that will be displayed
					var recalculateMapPosn = that.model.recenter;
					var matchingMarkerAverageLocation;
					var matchingMarkerTotalLatitude=0;
					var matchingMarkerTotalLongitude=0;
					var numLocations=0;
					
					if(that.model.clearMarkers) {
						that.map.clear('markers');
					}
					//that.model.location will not be null if we are showing a searched location 
					var locationsToDisplay = [];
					if(that.model.location!=null){
						locationsToDisplay.push(that.model.location);
					}
					else{
						locationsToDisplay=that.model.matchingLocations;
					}
	               // add a marker for each matching location
	               $(locationsToDisplay).each(function (idx, location) {
					  var locationInCampus=false;
					   //that.model.location will be null unless we are showing a searched location 
					   if(that.model.location==null && that.model.campus){
							if($.inArray(that.model.campus.name,location.campuses) >-1){
								locationInCampus=true;
							}
					   }
					   else {//No campus yet chosen or this is a search result and a location has been chosen so we disregard campus
							locationInCampus=true;
					   }
						
						   location.marker=that.map.addMarker({ 'position': new google.maps.LatLng(location.latitude, location.longitude) });

						   /* On desktop info windows need this 'delay' else they do not open */
						   location.marker.delayedWindowOpen = function(){
								setTimeout(location.marker.openInfoWindow,0);
						   }
							   location.marker.openInfoWindow=function() {
                                    var trimmedName=location.name.replace(/ /g,'');
									var outerdiv = $("<div/>").html("<strong><a>"+location.name +"</a></strong>"+ that.formatInfoAddress(location.address)).attr("id",trimmedName+"popup");
                                    // note - there needs to be a delay before this new element can be selected by jQuery (see test code)
                                    outerdiv.on('click',function(event){
										//stop click from reaching map container else we get search button visible in location details
										event.stopPropagation();
										that.model.location = location;
										that.events.onLocationSelect.fire(location);
									});
									that.map.openInfoWindow({ 'content': outerdiv.get(0)}, location.marker);
							   };
							/* see jquery.ui.map.js $.fn.extend for the marker 'click' method */
							location.marker.click(location.marker.delayedWindowOpen);
							if (locationInCampus) {
								numLocations++;
								matchingMarkerTotalLatitude+=location.latitude;
								matchingMarkerTotalLongitude+=location.longitude;
							}
	               });
				   
				   matchingMarkerAverageLocation = new google.maps.LatLng(matchingMarkerTotalLatitude/numLocations, matchingMarkerTotalLongitude/numLocations);
				   if ( recalculateMapPosn) {
							//if no campus chosen then go to the default location unless this is the result of a search
							if(!that.model.campus && numLocations>1) {
								that.currentLocation = new google.maps.LatLng(that.options.defaultCoordinates.latitude, that.options.defaultCoordinates.longitude);
							}
							else {
								that.currentLocation = matchingMarkerAverageLocation;
						   }
							// without this delay map does not center on mobile (but it does on desktop).
						    var timeout = 0;
							if(numLocations==1){
								timeout=300;
							}
							
							setTimeout(function(){
								that.map.option('center', that.currentLocation);
								bounds = that.map.get('map').getBounds();
								if(that.model.location){
									that.model.location.marker.openInfoWindow();
								}
							},timeout);
	               }
				  
           		};
				
				that.closeInfoWindow=function(){
					if(that.map.get('iw')) {
							that.map.get('iw').close();
							return true;
						}
				}
				$(".map-container").on({
					click:function(){
						that.closeInfoWindow();
					}
				});
				
                $(that.options.selectors.mapCategoriesLink).on('click', function () {
                    that.events.onShowCategoriesView.fire();
                });
				 $(that.options.selectors.mapCampusesLink).on('click', function () {
					that.events.onShowCampusesView.fire();
				 });
                // initialize map and set to default location
                that.options.mapOptions.callback = function () {
                    that.map = this;
                    that.currentLocation = new google.maps.LatLng(that.options.defaultCoordinates.latitude, that.options.defaultCoordinates.longitude);
                    that.map.option('center', that.currentLocation);
                    that.map.clear('markers');
                    $(".map #map-info .title").text(that.options.mapOptions.defaultMapInfoHeader);
                };
               that.locate("mapDisplay").gmap(that.options.mapOptions);
            }
        });
		//shows the address details for a location and links out externally to google maps directions
        fluid.defaults("map.LocationDetailView", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            renderOnInit: true,
            selectors: {
                locationName: ".map-location-name",
                locationDescription: ".map-location-description",
                locationAddress: ".map-location-address",
                directionsLink: ".map-location-directions-link",
                mapLink: ".map-location-map-link",
                locationImage: ".map-location-image"
            },
            events: {
                onLocationSelect: null,
                onShowLocation: {
                    event: "onLocationSelect",
                    args: [ "{LocationDetailView}" ]
                }
            },
            listeners: {
                onShowLocation: function(that) {
					that.model.locationDetailShow=true;
                    that.refreshView();
                    that.container.show();
                }
            },
            protoTree: {
                locationName: "${location.name}",
                locationDescription: "${location.description}",
                locationAddress: "${location.address}",
                directionsLink: {  },
                mapLink: {  },
                locationImage: { decorators: [ { type: "attrs", attributes: { src: "${location.img}" } } ] }
            },
            finalInitFunction: function(that) {
                that.locate("mapLink").live("click",that.locate("mapLink"), function () {
                    that.container.hide();
                    that.events.onLocationMapView.fire();
					that.model.locationDetailShow=false;
                });

                that.locate("directionsLink").live("click", function () {
                    window.open("https://maps.google.com?q=" + ( that.model.location.address ? that.model.location.address : that.model.location.latitude + "," + that.model.location.longitude ),'_blank') ;
                });
            }
        });

        /**
         * Retrieve the list of map locations via AJAX.
         */
        var loadMapData = function (that) {
            $.ajax({ 
                url: that.options.mapDataUrl,
                async: false,
                success: function (data) {
                    that.locations = data.mapData.locations;
                }
            
            });
        };
    
        /**
         * Utility function for converting degrees to radians.
         */
        var degreesToRadians = function (number) {
            return number * Math.PI / 180;
         };
    
         
    
    };
}
