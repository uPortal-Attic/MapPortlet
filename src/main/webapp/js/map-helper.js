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

var mapHelper = mapHelper || {};

/* this contains a number of utility methods for the google API v3 portlet.   Moved here entirely for readability */
(function ($, google) {

    var markers, locations;
    
    markers = [];

    /**
     * Open an info window for the specified location.
     */
    var openInfoWindow = function(marker, infoWindow){
        var location, html;
        
        // center the map on the just-clicked location
        marker.map.setCenter(marker.position);
        
        // update our info window to show the just-clicked location and 
        // open it
        location = marker.extraMeta;
        html = '<h3>' + location.name + ' (' + location.abbreviation + ')</h3>';
        html += '<br/> <img src="' + location.img + '"/>';
        html += '<p><a target="_blank" href="http://maps.google.com/?q=';
        html += encodeURIComponent(location.address + ' ' + location.zip) + '" >Directions</a></p>';
        infoWindow.setContent(html);
        infoWindow.open(marker.map, marker);

    };

    /**
     * Retrieve the list of map locations via AJAX.
     */
    var getAllLocations = function () {
        var allLocations;
        $.ajax({ 
            url: "/MapPortlet/api/locations.json",
            async: false,
            success: function (data) {
                allLocations = data;
            }
        });
        return allLocations;
    };
    
    /**
     * Sort function capable of sorting two locations by distance.
     */
    var sortByDistance = function (l1, l2) {
        return (l1.distance - l2.distance);
    };

    /**
     * Remove all markers from the map
     */
    var clearMarkers = function() {
        $(markers).each(function (idx, marker) {
            marker.setMap(null);
        });
        markers = [];
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

    mapHelper.search = function(map, infoWindow, query) {

        // make sure the query is all lower-case to facilitate string matching
        query = query.toLowerCase();

        // clear out any markers currently on the map
        clearMarkers();

        // if the locations list has not yet been retrieved, request it from
        // the server.  otherwise, use the cached copy
        if (!locations) {
            locations = getAllLocations();
        }
        
        // check each location to see if it matches our search string
        $(locations.buildings).each(function (idx, location) {
            if (location.searchText.indexOf(query) >= 0) {

                // create a new marker representing this location and
                // add it to the list
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(location.latitude, location.longitude), 
                    map: map,
                    draggable: false,
                    title: location.name,
                    extraMeta: location
                });
                
                // add the distance from the current map center to the 
                // location object so we can sort on it later
                marker.distance = getDistance(
                    { latitude: map.getCenter().lat(), longitude: map.getCenter().lng() }, 
                    { latitude: location.latitude, longitude: location.longitude }
                );

                google.maps.event.addListener(
                    marker,
                    'click',
                    function () {
                        openInfoWindow(marker, infoWindow); 
                    }
                );
                markers.push(marker);
            }
        });

        // order the markers by distance
        markers.sort(sortByDistance);

        // if at least one location was returned,  pan to the closest location 
        // and open the info window
        if (markers.length > 0) {
            openInfoWindow(markers[0], infoWindow);
        }
    };
    
})(jQuery, google);
