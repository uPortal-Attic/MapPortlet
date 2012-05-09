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
                searchContainer: ".map-search-form",
                searchResultsContainer: ".map-search-results",
                mapContainer: ".map-container",
                categoriesContainer: ".map-categories",
                categoryDetailContainer: ".map-category-detail",
                locationDetailContainer: ".map-location-detail"
            },
            events: {
                onReady: null,
                onUpdateSearchResults: null,
                onCategorySelect: null,
                onLocationSelect: null,
                onLocationMapView: null,
                onShowSearchView: null,
                onShowBrowseView: null,
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
                showBrowse: {
                    event: "onShowBrowseView",
                    args: [ "{CampusMap}" ]
                }
            },
            listeners: {
                showSearch: function(that) {
                    that.locate("searchContainer").show();
                    that.locate("mapContainer").show();
                    that.locate("searchResultsContainer").hide();
                    that.locate("categoriesContainer").hide();
                    that.locate("categoryDetailContainer").hide();
                },
                showLocationMap: function(that) {
                    that.locate("searchContainer").show();
                    that.locate("mapContainer").show();
                    that.locate("searchResultsContainer").hide();
                    that.locate("categoriesContainer").hide();
                    that.locate("categoryDetailContainer").hide();
                },
                showLocationDetails: function(that) {
                    that.locate("searchContainer").hide();
                    that.locate("mapContainer").hide();
                    that.locate("searchResultsContainer").hide();
                    that.locate("categoriesContainer").hide();
                    that.locate("categoryDetailContainer").hide();
                },
                showBrowse: function(that) {
                    that.locate("searchContainer").hide();
                    that.locate("searchResultsContainer").hide();
                    that.locate("mapContainer").hide();
                    that.locate("categoriesContainer").show();
                    that.locate("categoryDetailContainer").hide();
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
                            onLocationSelect: "{CampusMap}.events.onLocationSelect"
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
                            onShowSearchView: "{CampusMap}.events.onShowSearchView"
                        }
                    }
                },
                CategoryLocationsView: {
                    type: "map.CategoryLocationsView",
                    createOnEvent: "onReady",
                    container: "{CampusMap}.dom.categoryDetailContainer",
                    options: {
                        model: "{CampusMap}.model",
                        events: {
                            onCategorySelect: "{CampusMap}.events.onCategorySelect",
                            onLocationSelect: "{CampusMap}.events.onLocationSelect",
                            onShowBrowseView: "{CampusMap}.events.onShowBrowseView"
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
                            onShowBrowseView: "{CampusMap}.events.onShowBrowseView"
                        }
                    }
                },
                SearchResultsView: {
                    type: "map.SearchResultsView",
                    createOnEvent: "onReady",
                    container: "{CampusMap}.dom.searchResultsContainer",
                    options: {
                        model: "{CampusMap}.model",
                        events: {
                            onUpdateSearchResults: "{CampusMap}.events.onUpdateSearchResults",
                            onLocationSelect: "{CampusMap}.events.onLocationSelect"
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
                            onShowSearchView: "{CampusMap}.events.onShowSearchView",
                            onLocationMapView: "{CampusMap}.events.onLocationMapView"
                        }
                    }
                }
            },
            finalInitFunction: function(that) {
                $.get(
                    that.options.mapDataUrl, 
                    function(json) {
                        that.model = json.mapData;
                        
                        that.model.categories = [];
                        
                        $(that.model.locations).each(function (idx, location) {
                            $(location.categories).each(function (idx, category) {
                                if (!that.model.categories[category]) {
                                    that.model.categories.push({ name: category, locations: [] });
                                    that.model.categories[category] = that.model.categories[that.model.categories.length-1];
                                }
                                
                                that.model.categories[category].locations.push(location);
                            });
                        });
                        
                        that.events.onReady.fire();
                    }, 
                    "json"
                );
            }
        });
        

        /**
         * Search form view component
         */
        fluid.defaults("map.SearchView", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            selectors: {
                mapBrowseLink: ".map-browse-link",
                mapSearchInput: ".map-search-input",
                mapSearchResults: ".map-search-results"
            },
            events: {
                onUpdateSearchResults: null,
                onShowBrowseView: null
            },
            finalInitFunction: function (that) {

                that.search = function(query) {

                    that.model.matchingLocations = []; 

                    if (query) {
                        
                        // check each location to see if it matches our search string
                        query = query.toLowerCase();
                        if (query) {
                            $(that.model.locations).each(function (idx, location) {
                                if (location.searchText.indexOf(query) >= 0) {
                                    that.model.matchingLocations.push(location);
                                }
                            });
                        }
                        
                    }
                    that.events.onUpdateSearchResults.fire();
                     
                };

                $(that.options.selectors.mapSearchInput).live('keyup', function () {
                    that.search($(this).val()); 
                    return false; 
                });
                
                $(that.options.selectors.mapBrowseLink).live('click', function () {
                    that.events.onShowBrowseView.fire();
                });

            }
        });
        
        
        /**
         * Search results view component
         */
        fluid.defaults("map.SearchResultsView", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            selectors: {
                searchResults: ".map-search-results",
                location: ".map-search-result",
                locationLink: ".map-search-result-link"
            },
            repeatingSelectors: [ "location" ],
            // renderer proto-tree defining how data should be bound
            protoTree: {
                expander: {
                    type: "fluid.renderer.repeat",
                    repeatID: "location",
                    controlledBy: "matchingLocations",
                    pathAs: "location",
                    tree: {
                        locationLink: { value: "${{location}.name}", target: "javascript:;" }
                    }
                }
            },
            events: {
                onUpdateSearchResults: null,
                refreshResults: {
                    event: "onUpdateSearchResults",
                    args: [ "{SearchResultsView}" ]
                }
            },
            listeners: {
                refreshResults: function(that) {
                    if (that.model.matchingLocations) {
                        that.refreshView();
                        that.container.show();
                    } else {
                        that.container.hide();
                    }
                }
            },
            finalInitFunction: function(that) {
                that.locate("locationLink").live("click", function () {
                    var link = $(this);
                    var locationDiv = $(link.parents(that.options.selectors.location).get(0));
                    var locationIndex = locationDiv.index(that.options.selectors.location);
                    that.model.location = that.model.matchingLocations[locationIndex];
                    that.events.onLocationSelect.fire(that.model.location);
                });
            }
        });

        
        /**
         * Category detail view component
         */
        fluid.defaults("map.CategoriesView", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            renderOnInit: true,
            selectors: {
                searchLink: ".map-search-link",
                category: ".map-category",
                categoryLink: ".map-category-link"
            },
            events: {
                onShowSearchView: null
            },
            repeatingSelectors: [ "category" ],
            // renderer proto-tree defining how data should be bound
            protoTree: {
                searchLink: { value: "Search" },
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
                
                that.locate("categoryLink").live("click", function () {
                    var link = $(this);
                    var categoryDiv = $(link.parents(that.options.selectors.category).get(0));
                    var categoryIndex = categoryDiv.index(that.options.selectors.category);
                    that.model.category = that.model.categories[categoryIndex];
                    that.model.matchingLocations = that.model.category.locations;
                    that.container.hide();
                    that.events.onCategorySelect.fire(that.model.category);
                });

                $(that.options.selectors.searchLink).live('click', function () {
                    that.events.onShowSearchView.fire();
                });

            }
        });
        
        
        /**
         * Categories list component
         */
        fluid.defaults("map.CategoryLocationsView", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            renderOnInit: true,
            selectors: {
                backLink: ".map-category-back-link",
                categoryName: ".map-category-name",
                location: ".map-location",
                locationLink: ".map-location-link"
            },
            repeatingSelectors: [ "location" ],
            events: {
                onCategorySelect: null,
                onShowBrowseView: null,
                onShowCategory: {
                    event: "onCategorySelect",
                    args: [ "{CategoryLocationsView}" ]
                }
            },
            listeners: {
                onShowCategory: function(that, category) {
                    that.refreshView();
                    that.container.show();
                },
            },
            // renderer proto-tree defining how data should be bound
            protoTree: {
                backLink: { linktext: "Back", target: "javascript:;" },
                expander: {
                    type: "fluid.renderer.repeat",
                    repeatID: "location",
                    controlledBy: "matchingLocations",
                    pathAs: "location",
                    tree: {
                        locationLink: { value: "${{location}.name}", target: "javascript:;" }
                    }
                }
            },
            finalInitFunction: function(that) {

                $(that.options.selectors.locationLink).live("click", function () {
                    var link = $(this);
                    var locationDiv = $(link.parents(that.options.selectors.location).get(0));
                    var locationIndex = locationDiv.index(that.options.selectors.location);
                    that.model.location = that.model.category.locations[locationIndex];
                    that.container.hide();
                    that.events.onLocationSelect.fire(that.model.location);
                });
                
                $(that.options.selectors.backLink).live("click", function () {
                    that.events.onShowBrowseView.fire();
                });

            }
        });

        
        /**
         * Google Map view
         */
        fluid.defaults("map.MapView", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            selectors: {
                mapDisplay: ".map-display"
            },
            events: {
                onCategorySelect: null,
                onLocationMapView: null,
                onLocationSelect: null,
                onShowCategory: {
                    event: "onCategorySelect",
                    args: [ "{MapView}" ]
                },
                onShowLocation: {
                    event: "onLocationMapView",
                    args: [ "{MapView}" ]
                }
            },
            listeners: {
                onShowCategory: function(that) {
                    that.refreshView();
                },
                onShowLocation: function(that) {
                    that.model.matchingLocations = [ that.model.location ];
                    that.refreshView();
                }
            },
            finalInitFunction: function(that) {
    
                that.refreshView = function() {
                    
                    // clear out any markers currently on the map
                    that.map.clear('markers');

                    // calculate the distance from all matching locations to
                    // the current map center and sort by distance
                    $(that.model.matchingLocations).each(function (idx, location) {
                        location.distance = getDistance(
                            { latitude: that.map.option('center').lat(), longitude: that.map.option('center').lng() }, 
                            { latitude: location.latitude, longitude: location.longitude }
                        );
                    });
                    that.model.matchingLocations.sort(sortByDistance);

                    // add a marker for each matching location
                    $(that.model.matchingLocations).each(function (idx, location) {
                        var marker = that.map.addMarker({ 'position': new google.maps.LatLng(location.latitude, location.longitude) })
                            .click(function() {
                                var link = $(document.createElement("a")).attr("target", "javascript:;")
                                    .text(location.name + " (" + location.abbreviation + ")")
                                    .click(function () { that.events.onLocationSelect.fire(location); });
                                console.log(link);
                                that.map.openInfoWindow({ 'content': link.get(0) }, this);
                            });
                        
                        // if this is the closest location, re-center the map
                        // and open the info window
                        if (idx == 0) {
                            that.currentLocation = new google.maps.LatLng(location.latitude, location.longitude);
                            that.map.option('center', that.currentLocation);
                            marker.click();
                        }
                    });
    
    
                };
                
                // initialize map and set to default location
                that.options.mapOptions.callback = function () {
                    that.map = this;
                    that.currentLocation = new google.maps.LatLng(that.options.defaultCoordinates.latitude, that.options.defaultCoordinates.longitude);
                    that.map.option('center', that.currentLocation);
                    that.map.clear('markers');
                    
//                    that.map.getCurrentPosition(function(position, status) {
//                        if ( status === 'OK' ) {
//                            var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//                            that.map.option('center', clientPosition);
//                        }
//                    });   
                };
                that.locate("mapDisplay").gmap(that.options.mapOptions);
            }
        });

        fluid.defaults("map.LocationDetailView", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            renderOnInit: true,
            selectors: {
                backLink: ".map-location-back-link",
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
                onShowLocation: function(that, location) {
                    that.refreshView();
                    that.container.show();
                }
            },
            protoTree: {
                backLink: { value: "Back", target: "javascript:;" },
                locationName: "${location.name}",
                locationDescription: "${location.description}",
                locationAddress: "${location.address}",
                directionsLink: { linktext: "Directions", target: "javascript:;" },
                mapLink: { value: "View in Map", target: "javascript:;" },
                locationImage: { decorators: [ { type: "attrs", attributes: { src: "${location.img}" } } ] }
            },
            finalInitFunction: function(that) {
                that.locate("backLink").live("click", function () {
                    that.container.hide();
                    that.events.onShowSearchView.fire();
                });
                that.locate("mapLink").live("click", function () {
                    that.container.hide();
                    that.events.onLocationMapView.fire();
                });

                that.locate("directionsLink").live("click", function () {
                    window.location = "http://maps.google.com?q=" + ( that.model.location.address ? that.model.location.address : that.model.location.latitude + "," + that.model.location.longitude ) ;
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
         * Sort function capable of sorting two locations by distance.
         */
        var sortByDistance = function (l1, l2) {
            return (l1.distance - l2.distance);
        };
    
        /**
         * Utility function for converting degrees to radians.
         */
        var degreesToRadians = function (number) {
            return number * Math.PI / 180;
         };
    
         /**
          * Get the distance in kilometers between two points.  This implementation
          * uses a Javascript implementation of the Haversine formula provided at
          * http://www.movable-type.co.uk/scripts/latlong.html.
          */
        var getDistance = function (point1, point2) {
            var lat1 = degreesToRadians(point1.latitude);
            var lon1 = degreesToRadians(point2.longitude);
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
    
    };
}