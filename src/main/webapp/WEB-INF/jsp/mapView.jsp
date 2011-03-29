<!-- required includes -->
<%@ page contentType="text/html" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="rs" uri="http://www.jasig.org/resource-server" %>
<portlet:defineObjects/>


<!--

    Licensed to Jasig under one or more contributor license
    agreements. See the NOTICE file distributed with this work
    for additional information regarding copyright ownership.
    Jasig licenses this file to you under the Apache License,
    Version 2.0 (the "License"); you may not use this file
    except in compliance with the License. You may obtain a
    copy of the License at:

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied. See the License for the
    specific language governing permissions and limitations
    under the License.

-->

<!-- assigning a variable to the name so it can be called in a non-conflicting way -->
<c:set var="n"><portlet:namespace/></c:set>
<script src="http://maps.google.com/maps/api/js?sensor=true"></script>
<script src="<c:url value="/rs/jquery/1.5/jquery-1.5.min.js"/>" type="text/javascript"></script>
<script src="/MapPortlet/js/map-helper.js" type="text/javascript"></script>

<!-- so called 'boilerplate' namespace.  This allows '.jQuery' to be used without conflict -->
<script type="text/javascript"> 
    var ${n} = ${n} || {}; //create a unique variable to assign our namespace too
    ${n}.jQuery = jQuery.noConflict(true); //assign jQuery to this namespace
    ${n}.google = google || {};
    ${n}.google.maps = google.maps || {};  // these exist in an effort to prevent conflict in case multiple google map portlets are on the same uportal page.

    /* I use these to add radial math to numbers.  The fact is that the map is converting from a sphere to a flat screen, and this is used to help calculate that */
    Number.prototype.toRad = function() {
       return this * Math.PI / 180;
    }

    Number.prototype.toDeg = function() {
       return this * 180 / Math.PI;
    }// end of radial math
    

    
    /*  runs when the document is finished loading.  This prevents things like the 'div' from being fully created */
    ${n}.jQuery(document).ready(function () { 

        var $ = ${n}.jQuery; //reassign $ for normal use of jQuery
        var google = ${n}.google;
        
        var startingLocation;  // the starting point where the user begins

        ${n}.geoSupport = Boolean(); // variable used to notify if the browser supports geolocation and users have it enabled
        ${n}.campusMap;         // this is the main campus map
        ${n}.infoWindow; // used for pop-up information - apparently info windows so useful they are basically required
        var mapOptions;
        ${n}.contentString;


        /* runs a handle to deal with the cases where there cannot be a strating location based on geolocation.  Not actually doing anything while geoLocation() is not being called */
        var handleGeolocationErrors = function(errorFlag) {

            if (errorFlag === true) {
                startingLocation = ${n}.cthulhu;
                ${n}.contentString = "You angered the ancient one Cthulhu because your browser supports geoLocation but returned an error anyway, you have been sent to the sunken city of R'lyeh.";
                ${n}.campusMap.setZoom(3);
            } else {
                startingLocation = ${n}.unicon;
                ${n}.contentString = "something apparently broke, get back to work and fix it.";
            }

            // sets starting location and creates a pop-up message for it. 
            ${n}.campusMap.setCenter(startingLocation);  
            ${n}.infoWindow.setContent(${n}.contentString);
            ${n}.infoWindow.setPosition(startingLocation);
            ${n}.infoWindow.open(${n}.campusMap);
        }

        /* 
        this checks to see if the browser supports geoLocation.  Generally this includes the current versions of chrome, firefox, and mobile browsers.  
        other browsers with appropriate plugins work too, but usually require plugins as is the case with internet explorer.
        Only the 'standard' W3C is implemented because google suggested google gears will not be supported eventually 
        */
        var geoLocation = function() {
            /* first run on load.  Creates starting variables and detects for a location */
            ${n}.unicon = new google.maps.LatLng(33.303919,-111.768572); // TODO: remove - temp variable for testing locations based on Unicon
            ${n}.cthulhu = new google.maps.LatLng(-47.15, -126.716667);  // TODO: remove - temp variable for testing locations based on the estimated whereabouts of Cthulhu, the sunken city of R'lyeh
            if(navigator.geolocation) {
                ${n}.geoLocation = true;

                navigator.geolocation.getCurrentPosition(function(position) {
                    startingLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude); // pulls the position from the browser and makes it the starting position

                    ${n}.contentString = "Location found using W3C standard";  // what will be said in the pop-up messages
                        console.log(${n}.contentString + " is on fire");
                    ${n}.campusMap.setCenter(startingLocation);

                    ${n}.infoWindow.setContent(${n}.contentString);    // makes the pop-up message.
                    ${n}.infoWindow.setPosition(startingLocation);
                    ${n}.infoWindow.open(${n}.campusMap);
                }, function() {
                    handleGeolocationErrors(${n}.geoLocation);   // runs the handler to deal with the possibility that 'navigator' doesn't have geolocation
                });

            } else {
            // Browser doesn't support Geolocation
                ${n}.geoLocation = false;
                handleGeolocationErrors(${n}.geoLocation);
            }
        }

        /* initialize the map
            currently this does NOT actually set a starting location.  The map might not appear until a starting location is set 
            All of the "___Control" (fill in blank) can have "___ControlOptions: { google.maps.ControlPosition.X }" where X is something like "TOP_RIGHT" or "BOTTOM_CENTER"
        */
        var initializeMap = function() {
            /* currently left mostly to default values, however may want to change depending on purpose of map and expected interface (PC W/mouse vs. touch screen PC vs. mobile device)*/
            mapOptions = {   // most options present for future development ease of reference.  Enable or disable as one pleases
                zoom: 10,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DEFAULT     // also could be "HORIZONTAL_BAR" or "DROPDOWN_MENU"
                },
                panControl: true,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.DEFAULT       // also could be "SMALL" or "LARGE"
                },
                scaleControl: true,
                streetViewControl: true,                     // only appears if street view is currently the view
                rotateControl: true,                        // only functions if "set Tilt" below is set to 45, so currently disabled
                overviewMapControl: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP   // can be ROADMAP, SATELLITE, HYBRID, or TERRAIN

            };

            ${n}.infoWindow = new google.maps.InfoWindow();
            ${n}.campusMap = new google.maps.Map($("#${n}mapArea").get(0), mapOptions); 

            ${n}.campusMap.setTilt(0); // this can be set to 45 to allow for 45 degree angles if in satalight mode.  This forces top-down (until 45degree is requested)
                    // Might be useful for navigating since "road map" and/or "top down" makes landmarks hard to spot for somebody traveling on foot/bike/car

            /* info for custom controls http://code.google.com/apis/maps/documentation/javascript/controls.html#CustomDrawing */

            currentLocation = new google.maps.LatLng(41.300937,-72.932103);
            ${n}.contentString = ("we are currently at " + currentLocation.lat() + ", "+ currentLocation.lng());
            ${n}.campusMap.setCenter(currentLocation);

            ${n}.infoWindow.setContent(${n}.contentString);    // makes the pop-up message.
            ${n}.infoWindow.setPosition(currentLocation);
            ${n}.infoWindow.open(${n}.campusMap);
        }

        /* this is the test version of the JSON parser.  It may be able to be renamed later for whatever purpose needed.  TODO: prolly remove */
        var testJSON = function() {
            $("#${n}infoArea").get(0).style.backgroundColor = "yellow"; // TODO: remove > this is a test to show the area is being accessed.   the div is defaulted to 'pink' for testing
            
            /* this checks the JSON location information. When completed remove 'console.log' calls */            
            var getInfo = $.get(
            
                "/MapPortlet/api/locations.json",
                {
                    //this is data... I don't know what actually goes here
                }, 
                function(locData, txtStatus, jqXHRthingy) { //TODO:  Finish this so it parses and does SOMETHING with all the jazz it has. 
                    var ix = 0;
                    
                    /*  TESTING:  currently this loads location information, but not currently implemented.   */

                    currentLocation = new google.maps.LatLng(locData.buildings[ix].latitude, locData.buildings[ix].longitude);
                    ${n}.contentString = ("we are currently at " + locData.buildings[ix].name + locData.buildings[ix].address);
                    ${n}.campusMap.setCenter(currentLocation);

                    ${n}.infoWindow.setContent(${n}.contentString);    // makes the pop-up message.
                    ${n}.infoWindow.setPosition(currentLocation);
                    ${n}.infoWindow.open(${n}.campusMap);

                    for (i = 0; i < locData.buildings.length; i++)
                    {
                        currentLocation = new google.maps.LatLng(locData.buildings[i].latitude, locData.buildings[i].longitude);
                        var marker = new google.maps.Marker({
                            position: currentLocation,          // the actual location on the map. 
                            map: ${n}.campusMap,                // which map they go on
                            draggable: false,                   // if you can move the marker - in this case 'no' we don't want users moving them
                            title: (locData.buildings[i].name)  // for tool-tip that appears when you hold your mouse over the marker
                        });
                    }
                },
                "json" // this is the TYPE of thing we are getting, which is a JSON file
            )
            .complete(function() {console.log("this runs when complete"); });
            //console.log("Data Loaded: " + locData.buildings);
        }

        

        ${n}.clickSearch = function()
        {
            var searchParams = $("#${n}searchParamBox").get(0).value;
            var maxDist = parseFloat($("#${n}distanceBox").get(0).value);
            mapHelper.searchLocations(${n}.campusMap, ${n}.infoWindow, searchParams, maxDist, new google.maps.LatLng(41.300937,-72.932103), $("#${n}textSpace").get(0) )
        }

        initializeMap();
        // geoLocation(); // functional, but commented out because its not currently going to be implemented. 
        //testJSON();  // adds markers to all the locations in the JSON list
        
        //searchLocations(2, new google.maps.LatLng(41.300937,-72.932103));   // searches locations and creates markers of them based on the distance of 25
        });

/* stop trying geolocation */

</script>

<!-- the 1st div is to allow the 2nd div to have space.  The map must be inside a div measured in pixels, not '%'.  In this case I've created an outer 'shell' and let the inner div be as big or small as it wants.  There is no way I can see around forcing a 'minimum' size for this portlet of some kind. -->
<div id="${n}shellBody" style="height: 700px; width: 800px"> 
    <div id="${n}mapArea" style="background-color:green;height: 80%; width:100%">This did not load properly.  Try reloading or enabling scripts or something.</div>
    <div id="${n}textSpace" style="height: 5%; width:100%"></div>
    <div id="${n}infoArea" style="background-color:pink;height:15%; width:100%"> Type words by which you want to search:  <input id="${n}searchParamBox" autocomplete="off" type="text" size="10" name="search" title="search"/> <p> Type allowed distance in miles. (optional) <input id="${n}distanceBox" autocomplete="off" type="text" size="10" name="search" title="search"/> present location is at "41.300937,-72.932103" which is near where all this stuff is. <p> <input id="${n}goButton" type="button" value="click" onclick="${n}.clickSearch();" /></div>
</div> 
