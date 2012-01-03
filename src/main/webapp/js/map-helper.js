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

        fluid.defaults("map.view", {
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
                mapSearchForm: ".map-search-form",
                mapSearchInput: ".map-search-input",
                mapDisplay: ".map-display"
            },
            finalInitFunction: function(that) {
    
                /**
                 * Remove all markers from the map
                 */
                that.clearMarkers = function() {
                    $(that.markers).each(function (idx, marker) {
                        marker.setMap(null);
                    });
                    that.markers = [];
                };
    
                /**
                 * Open an info window for the specified location.
                 */
                that.openInfoWindow = function(marker){
                    var location, html;
    
                    // center the map on the just-clicked location
                    marker.map.setCenter(marker.position);
    
                    // update our info window to show the just-clicked location and 
                    // open it
                    location = marker.extraMeta;
                    html = '<h3>' + location.name;
                    if (that.options.includeAbbreviation) {
                        html += ' (' + location.abbreviation + ')';
                    }
                    html += '</h3><br/> <img src="' + location.img + '"/>';
                    html += '<p><a target="_blank" href="http://maps.google.com/?q=';
                    html += encodeURIComponent(location.address) + '" >Directions</a></p>';
                    that.infoWindow.setContent(html);
                    that.infoWindow.open(marker.map, marker);
    
                };
    
                that.findLocation = function(code) {
                    code = code.toLowerCase();
                    
                    // clear out any markers currently on the map
                    that.clearMarkers();
    
                    // if the locations list has not yet been retrieved, request it from
                    // the server.  otherwise, use the cached copy
                    if (!that.locations) {
                        loadMapData(that);
                    }
    
                    for (var i = 0; i < that.locations.length; i++) {
                        var location = that.locations[i];
                        if (location.abbreviation.toLowerCase() === code) {
                            that.markers.push(createMarker(location, that));
                            that.openInfoWindow(that.markers[0]);
                            return;
                        }
                    }
                };
    
                that.search = function(query) {
    
                    // clear out any markers currently on the map
                    that.clearMarkers();
    
                    // if the locations list has not yet been retrieved, request it from
                    // the server.  otherwise, use the cached copy
                    if (!that.locations) {
                        loadMapData(that);
                    }
    
                    // check each location to see if it matches our search string
                    query = query.toLowerCase();
                    $(that.locations).each(function (idx, location) {
                        if (location.searchText.indexOf(query) >= 0) {
                            console.log("matched", location);
                            that.markers.push(createMarker(location, that));
                        }
                    });
    
                    // order the markers by distance
                    that.markers.sort(sortByDistance);
    
                    // if at least one location was returned,  pan to the closest location 
                    // and open the info window
                    if (that.markers.length > 0) {
                        that.openInfoWindow(that.markers[0]);
                    }
                };
                
                // initialize map and set to default location
                that.map = new google.maps.Map(that.locate("mapDisplay").get(0), that.options.mapOptions); 
                that.infoWindow = new google.maps.InfoWindow();
                
                that.currentLocation = new google.maps.LatLng(that.options.defaultCoordinates.latitude, that.options.defaultCoordinates.longitude);
                that.map.setCenter(that.currentLocation);
                
                if (that.options.location) {
                    that.findLocation(that.options.location);
                }
                
                that.locate("mapSearchForm").submit(function () { that.search(that.locate("mapSearchInput").val()); return false; });
                
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
    
        var createMarker = function (location, that) {
    
            // create a new marker representing this location and
            // add it to the list
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(location.latitude, location.longitude), 
                map: that.map,
                draggable: false,
                title: location.name,
                extraMeta: location
            });
    
            // add the distance from the current map center to the 
            // location object so we can sort on it later
            marker.distance = getDistance(
                { latitude: that.map.getCenter().lat(), longitude: that.map.getCenter().lng() }, 
                { latitude: location.latitude, longitude: location.longitude }
            );
    
            google.maps.event.addListener(
                marker,
                'click',
                function () {
                    that.openInfoWindow(marker); 
                }
            );
    
            return marker;
            
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