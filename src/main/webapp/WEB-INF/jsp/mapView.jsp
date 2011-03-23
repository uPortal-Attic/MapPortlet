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
<script src="<c:url value="/rs/jquery/1.4.2/jquery-1.4.2.min.js"/>" type="text/javascript"></script>

<!-- so called 'boilerplate' namespace.  This allows '.jQuery' to be used without conflict -->
<script type="text/javascript"> 
    var ${n} = ${n} || {}; //create a unique variable to assign our namespace too
    ${n}.jQuery = jQuery.noConflict(true); //assign jQuery to this namespace
    ${n}.google = google || {};
    ${n}.google.maps = google.maps || {};  // these exist in an effort to prevent conflict in case multiple google map portlets are on the same uportal page.
    
    /*  runs when the document is finished loading.  This prevents things like the 'div' from being fully created */
    ${n}.jQuery(document).ready(function () { 

        var $ = ${n}.jQuery; //reassign $ for normal use of jQuery
        var google = ${n}.google;
        
        var startingLocation;  // the starting point where the user begins
        var unicon = new google.maps.LatLng(33.303919,-111.768572); // TODO: remove - temp variable for testing locations based on Unicon
        var cthulhu = new google.maps.LatLng(-47.15, -126.716667);  // TODO: remove - temp variable for testing locations based on the estimated whereabouts of Cthulhu, the sunken city of R'lyeh
        var geoSupport = Boolean(); // variable used to notify if the browser supports geolocation and users have it enabled
        ${n}.campusMap;         // this is the main campus map
        ${n}.infoWindow; // used for pop-up information - apparently info windows so useful they are basically required
        var mapOptions;
        ${n}.contentString;


        /* runs a handle to deal with the cases where there cannot be a strating location based on geolocation */
        var handleGeolocationErrors = function(errorFlag) {
            if (errorFlag === true) {
                startingLocation = cthulhu;
                ${n}.contentString = "You have angered the ancient one Cthulhu because your browser supports geoLocation but returned an error anyway, you have been sent to the sunken city of R'lyeh.";
                ${n}.campusMap.setZoom(3);
            } else {
                startingLocation = unicon;
                ${n}.contentString = "something apparently broke, get back to work and fix it.";
            }

            // sets starting location and creates a pop-up message for it. 
            ${n}.campusMap.setCenter(startingLocation);  
            ${n}.infoWindow.setContent(${n}.contentString);
            ${n}.infoWindow.setPosition(startingLocation);
            ${n}.infoWindow.open(${n}.campusMap);
        }

        /* initialize the map */
        var initializeMap = function() {
            mapOptions = {
                zoom: 6,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            ${n}.infoWindow = new google.maps.InfoWindow();
            ${n}.campusMap = new google.maps.Map($("#${n}mapArea").get(0), mapOptions); 

            /* first run on load.  Creates starting variables and detects for a location */
            if(navigator.geolocation) {
                geoLocation = true;
                navigator.geolocation.getCurrentPosition(function(position) {
                    startingLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude); // pulls the position from the browser and makes it the starting position
                    ${n}.contentString = "Location found using W3C standard";  // what will be said in the pop-up messages
                    ${n}.campusMap.setCenter(startingLocation);

                    ${n}.infoWindow.setContent(${n}.contentString);    // makes the pop-up message.
                    ${n}.infoWindow.setPosition(startingLocation);
                    ${n}.infoWindow.open(${n}.campusMap);
                }, function() {
                    handleGeolocationErrors(geoLocation);   // runs the handler to deal with the possibility that 'navigator' doesn't have geolocation
                });
            } else {
            // Browser doesn't support Geolocation
                geoLocation = false;
                handleGeolocationErrors(geoLocation);
            }
        }

        /* this is the test version of the JSON parser.  It may be able to be renamed later for whatever purpose needed */
        var testJSON = function() {
            $("#${n}infoArea").get(0).style.backgroundColor = "yellow"; // TODO: remove > this is a test to show the area is being accessed.   the div is defaulted to 'pink' for testing
            
            /* this checks the JSON location information. When completed remove 'console.log' calls */            
            var getInfo = $.get(
            
                "/MapPortlet/api/locations.json",
                {
                    //this is data... I don't know what actually goes here
                }, 
                function(locData, txtStatus, jqXHRthingy) { //TODO:  Finish this so it parses and does SOMETHING with all the jazz it has. 
                    var i = 0;
                    
                    /*  TESTING:  currently this loads location information, but not currently implemented.   */
                    console.log("test string " + ${n}.contentString)
                    currentLocation = new google.maps.LatLng(locData.buildings[i].latitude, locData.buildings[i].longitude);
                    ${n}.contentString = ("we are currently at " + locData.buildings[i].name + locData.buildings[i].address);

                    ${n}.infoWindow.setContent(${n}.contentString);    // makes the pop-up message.
                    ${n}.infoWindow.setPosition(currentLocation);
                    ${n}.infoWindow.open(${n}.campusMap);
                    console.log("good output " + locData.buildings[i].address );
                    console.log("should match info window " + locData.buildings[i].name + locData.buildings[i].address);
                },
                "json" // this is the TYPE of thing we are getting, which is a JSON file
            )
            .complete(function() {console.log("this runs when complete"); });
            //console.log("Data Loaded: " + locData.buildings);
        }

        initializeMap();
        testJSON();
    });

/* stop trying geolocation */

</script>

<!-- the 1st div is to allow the 2nd div to have space.  The map must be inside a div measured in pixels, not '%'.  In this case I've created an outer 'shell' and let the inner div be as big or small as it wants.  There is no way I can see around forcing a 'minimum' size for this portlet of some kind. -->
<div id="${n}shellBody" style="height: 500px; width: 800px"> 
    <div id="${n}mapArea" style="background-color:green;height: 80%; width:100%">This did not load properly.  Try reloading or enabling scripts or something.</div>
    <div id="${n}infoArea" style="background-color:pink;height:20%; width:100%"> this exists. <input autocomplete="off" type="text" size="10" name="search" title="search"></div>
</div> 
