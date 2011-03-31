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
(function ($) {
        mapHelper.markerList =[];

        /*  makes the info window appear.  LocInfo needs to be a reference to the metadata of the location.  The map and info should be initalized already */
        mapHelper.deployInfoWindow = function(mapRef, infoWindowRef, locInfo){
            currentLocation = new google.maps.LatLng(locInfo.latitude, locInfo.longitude);
            var tempString = ("This is " + locInfo.name + '<br> <IMG src='+locInfo.img
                                                + '> <br> direct Link: <a target="_blank" href="http://maps.google.com/?q=' 
                                                + locInfo.address + '" > Click Here </a>'  );  // onclick="window.open(this.href);return false;" might also work instead of target
            mapRef.setCenter(currentLocation);

            infoWindowRef.setContent(tempString);    // makes the pop-up message.
            infoWindowRef.setPosition(currentLocation);
            infoWindowRef.open(mapRef);

            /*  I've decided this totally needs to be done by a UI guy.   Its got pictures and stuff that aught to go here */
        }

        /* loads the JSON with locations and searches through them drawing any on the screen within 'max distance' of 'position' where position is a google.maps.LatLng
         * @params:     theMap = a ref to the map
         *              infoWindow = a ref to the infoWindow
         *              searchString = what the user is searching to get
         *              maxDistance = the maximum distance the object should be in (optional)
         *              originPosition = the position from where the max distance is measured (optional) 
         *              infoArea = a div area for outputting basic text.  TODO: Remove this one because it really should have another way of communicating with user
         */
        mapHelper.searchLocations = function(theMap, infoWindow, addressString, maxDistance, originPosition, defaultPosition, infoArea)
        {
            mapHelper.clearMarkers();  // clears the markers to start a new search.


            /* this checks the JSON location information. When completed remove 'console.log' calls */            
            var getInfo = $.get(

                "/MapPortlet/api/locations.json",
                {
                    //this is data... I don't know what actually goes here
                }, 
                function(locData, txtStatus, jqXHRthingy) { 
                    
                    // variables required for searching
                    var xCoord = originPosition.lng();  // longitude of search origin
                    var yCoord = originPosition.lat();// latitude of search origin
                    var scaleConstant = 3959;  // 3959 = in miles, 6371 = kilometers. This is measurement of the earth's radius that sets the standard for distance in the forumla
                    // end of variables required for searching


                    for (i = 0; i < locData.buildings.length; i++)
                    {
                        if (locData.buildings[i].searchText.indexOf(addressString.toLowerCase()) >= 0) 
                        {
                            currentLocation = new google.maps.LatLng(locData.buildings[i].latitude, locData.buildings[i].longitude);
                            var marker = new google.maps.Marker({
                                position: currentLocation,          // the actual location on the map. 
                                map: theMap,                // which map they go on
                                draggable: false,                   // if you can move the marker - in this case 'no' we don't want users moving them
                                title: (locData.buildings[i].name),  // for tool-tip that appears when you hold your mouse over the marker
                                extraMeta: locData.buildings[i]    // the meta data that calls it.  Makes it so any reference to the marker knows all it needs to know about the location
                            });
                            google.maps.event.addListener(marker, 'click', (function (marker)
                                                                                {   // runs a function, making note to keep the
                                                                                    return function()
                                                                                    {
                                                                                        mapHelper.deployInfoWindow(marker.map, infoWindow, marker.extraMeta); 
                                                                                    };
                                                                                }
                                                                            )(marker) // specifies this reference to 'marker' NEEDS to be the current reference to 'marker'
                                                         );
                                                                                              
                            mapHelper.markerList.push(marker);
                        }
                        
                        /* TODO:  consider this:  compare locations of all the results and scale zoom accordingly.  If originLocation != default, include it in scaling. */

                        if (maxDistance > 0)
                        {
                            // distance code start
                            var currentX = parseFloat(locData.buildings[i].longitude); // longitude of currently inspected location
                            var currentY = parseFloat(locData.buildings[i].latitude); // latitude of currently inspected location
                            var dX = (currentX - xCoord).toRad(); // distance of longitude = distance formula 
                            var dY = (currentY - yCoord).toRad(); // distance of latitude = ''

                            /* Dirty square root heavy version I created for testing. not recommended, but didn't want to remove because I trust it more than the current method because Landis ran the math
                            var arbitraryN = Math.sin(dY/2) * Math.sin(dY/2) +  // square half the distance over our X axis
                                                Math.cos(yCoord.toRad()) * Math.cos(currentY.toRad()) *  // heaven help us if order of opperations in javascript changes
                                                Math.sin(dX/2) * Math.sin(dX/2); // square of half the distance over our Y axis
                            var c = 2 * Math.atan2(Math.sqrt(arbitraryN), Math.sqrt(1-arbitraryN));  // getting angular distance
                            var distance = scaleConstant * c; // and solving for distance
                            // distance code end*/

                            
                            // totally found this one on the internet somewhere. Do not promise functionality, but seems to work close enough.  Use above if problems appear 
                            var distance = Math.acos(Math.sin(yCoord)*Math.sin(currentY) + 
                                  Math.cos(yCoord)*Math.cos(currentY) *
                                  Math.cos(dX)) * scaleConstant;

                            // if distance to location is within the maxDistance.
                            if (distance <= maxDistance)
                            {
                                currentLocation = new google.maps.LatLng(locData.buildings[i].latitude, locData.buildings[i].longitude);
                                var marker = new google.maps.Marker({
                                    position: currentLocation,          // the actual location on the map. 
                                    map: theMap,                // which map they go on
                                    draggable: false,                   // if you can move the marker - in this case 'no' we don't want users moving them
                                    title: (locData.buildings[i].name)  // for tool-tip that appears when you hold your mouse over the marker
                                });
                            } // end of if statement
                        }
                    }
                    
                },
                "json" // this is the TYPE of thing we are getting, which is a JSON file
            )
                .complete(function() { 
                    if (mapHelper.markerList.length == 1)
                    {
                        infoArea.innerHTML="nyr"; 
                        mapHelper.deployInfoWindow(theMap, infoWindow, mapHelper.markerList[0].extraMeta);
                    } else
                    {
                        infoArea.innerHTML="there are " + mapHelper.markerList.length + " results. click a marker to see info.";  
                    }
                });
        }

        mapHelper.geoCodeFromString = function(address, theMap, startingMarker, infoArea)
        {
            geocoder = new google.maps.Geocoder();
            geocoder.geocode( { 'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    theMap.setCenter(results[0].geometry.location);
                    startingMarker.setPosition(results[0].geometry.location);
                } else {
                    infoArea.innerHTML = ("Geocode was not successful for the following reason: " + status);
                }
            });
        }


        /* runs a handle to deal with the cases where there cannot be a strating location based on geolocation.  Not actually doing anything while geoLocation() is not being called */
        mapHelper.handleGeolocationErrors = function(errorFlag, theMap, usableInfoWindow, addressBox) {
            var contentString; // Move to spring
            if (errorFlag === true) {
                startingPoint = undefined;
                addressBox.value = "test";
                contentString = "failed but passed";
            } else {
                startingLocation = undefined;
                contentString = "something apparently broke, get back to work and fix it.";
            }
        }

        mapHelper.clearMarkers = function() {
            console.log(" clearing markers " + mapHelper.markerList.length);
            if (mapHelper.markerList)
            {
                for (i = 0; i< mapHelper.markerList.length; i++)
                {
                    
                    mapHelper.markerList[i].setMap(null);
                    mapHelper.markerList[i] = null;
                }
            }
            mapHelper.markerList.length = 0;
        }
})(jQuery);
