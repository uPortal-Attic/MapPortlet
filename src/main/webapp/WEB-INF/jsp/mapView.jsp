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
<script src="<c:url value="/js/map-helper.js"/>" type="text/javascript"></script>

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
        
        ${n}.originLocation;  // the starting point where the user is located

        ${n}.geoSupport = false; // variable used to notify if the browser supports geolocation and users have it enabled
        ${n}.campusMap;         // this is the main campus map
        ${n}.infoWindow; // used for pop-up information - apparently info windows so useful they are basically required
        var mapOptions;
        ${n}.contentString;
        
        ${n}.defaultLocation;
        ${n}.startingMarker;


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

            ${n}.unicon = new google.maps.LatLng(33.303919,-111.768572); // TODO: remove - temp variable for testing locations based on Unicon
            ${n}.cthulhu = new google.maps.LatLng(-47.15, -126.716667);  // TODO: remove - temp variable for testing locations based on the estimated whereabouts of Cthulhu, the sunken city of R'lyeh

            ${n}.infoWindow = new google.maps.InfoWindow();
            ${n}.campusMap = new google.maps.Map($("#${n}mapArea").get(0), mapOptions); 

            ${n}.campusMap.setTilt(0); // this can be set to 45 to allow for 45 degree angles if in satalight mode.  This forces top-down (until 45degree is requested)
                    // Might be useful for navigating since "road map" and/or "top down" makes landmarks hard to spot for somebody traveling on foot/bike/car

            /* info for custom controls http://code.google.com/apis/maps/documentation/javascript/controls.html#CustomDrawing */

            $("#${n}originBox").get(0).disabled = true;
            $("#${n}originBox").get(0).value="default Location";
            ${n}.defaultLocation = new google.maps.LatLng(41.300937,-72.932103);
            ${n}.originLocation = ${n}.defaultLocation;   // sets the location of the user at the default location.
            ${n}.contentString = ("This is the default position");
            ${n}.campusMap.setCenter(${n}.defaultLocation);

            ${n}.infoWindow.setContent(${n}.contentString);    // makes the pop-up message.
            ${n}.infoWindow.setPosition(${n}.defaultLocation);
            ${n}.infoWindow.open(${n}.campusMap);

            markerImage = new google.maps.MarkerImage('/MapPortlet/images/bluedot.png',
                new google.maps.Size(16, 16),// This marker is 16 pixels by 16 pixels
                new google.maps.Point(0,0),  // The origin for this image (in case of sprite sheet)
                new google.maps.Point(8, 8));// The anchor for this image is the center of the image at 8,8
            
            ${n}.startingMarker = new google.maps.Marker({
                position: ${n}.defaultLocation,
                map: ${n}.campusMap,
                icon: markerImage
            });
        }

        /* 
        this checks to see if the browser supports geoLocation.  Generally this includes the current versions of chrome, firefox, and mobile browsers.  
        other browsers with appropriate plugins work too, but usually require plugins as is the case with internet explorer.
        Only the 'standard' W3C is implemented because google suggested google gears will not be supported eventually 
        */
        var geoLocation = function(theMap, usableInfoWindow,  addressBox) {
            /* first run on load.  Creates starting variables and detects for a location */
            if(navigator.geolocation) {

                navigator.geolocation.getCurrentPosition(function(position) {
                    // Run code for browsers that support geo-locating and have it enabled
                    ${n}.geoSupport = true;
                    ${n}.originLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude); // pulls the position from the browser and makes it the starting position


                    ${n}.startingMarker.setPosition(${n}.originLocation);

                }, function() {
                    // run code for browsers that support geo-locating, but have it disabled
                    mapHelper.handleGeolocationErrors(${n}.geoSupport, theMap, usableInfoWindow, addressBox);   // runs the handler to deal with the possibility that 'navigator' doesn't have geolocation
                });

            } else {
            // run code for a browser that doesn't support Geolocation.
                ${n}.geoSupport = false;
                mapHelper.handleGeolocationErrors(${n}.geoSupport, theMap, usableInfoWindow, addressBox);
                
            }
        }

        ${n}.geoLocationButton = function()
        {
            $("#${n}originBox").get(0).disabled = true;
            $("#${n}originBox").get(0).value="geoLocation Mode";
            geoLocation(${n}.campusMap, ${n}.infoWindow, $("#${n}textSpace").get(0));
            if (${n}.geoSupport)
            { // if geoSupport is presently turned on - turn it off and set back to default
                ${n}.originLocation = ${n}.defaultLocation;
                ${n}.startingMarker.setPosition(${n}.originLocation);
                ${n}.campusMap.setCenter(${n}.originLocation);
                $("#${n}originBox").get(0).disabled=true;
                
            }
            else
            { // if geoSupport is presently turned off, try and turn it on
                
            }
        }

        ${n}.disableGeoLocation = function()
        {
            $("#${n}originBox").get(0).disabled = false;
            $("#${n}originBox").get(0).value="";
        }
        
        ${n}.typeOrigin = function()
        {
            var searchString = $("#${n}originBox").get(0).value;
            mapHelper.geoCodeFromString(searchString, ${n}.campusMap, ${n}.startingMarker, $("#${n}textSpace").get(0))
            ${n}.originLocation = ${n}.startingMarker.position;
        }

        ${n}.resetOrigin = function()
        {
            $("#${n}originBox").get(0).disabled = true;
            $("#${n}originBox").get(0).value="default Location";
            ${n}.startingMarker.setPosition(${n}.defaultLocation);
            ${n}.originLocation = ${n}.defaultLocation;
        }

        ${n}.clickSearch = function()
        {
            var searchParams = $("#${n}searchParamBox").get(0).value;
            var maxDist = parseFloat($("#${n}distanceBox").get(0).value);
            if (${n}.geoSupport)
            {
                if (${n}.originLocation == undefined)
                {
                    ${n}.originLocation = ${n}.defaultLocation;
                }
            } else
            {
                 ${n}.originLocation = ${n}.defaultLocation;
            }
            mapHelper.searchLocations(${n}.campusMap, ${n}.infoWindow, searchParams, maxDist, ${n}.originLocation, ${n}.defaultLocation, $("#${n}textSpace").get(0) )
        }

        initializeMap();
        // geoLocation(); // functional, but commented out because its not currently going to be implemented. 
        //testJSON();  // adds markers to all the locations in the JSON list
        
        //searchLocations(2, new google.maps.LatLng(41.300937,-72.932103));   // searches locations and creates markers of them based on the distance of 25
    });

</script>

<!-- the 1st div is to allow the 2nd div to have space.  The map must be inside a div measured in pixels, not '%'.  In this case I've created an outer 'shell' and let the inner div be as big or small as it wants.  There is no way I can see around forcing a 'minimum' size for this portlet of some kind. -->
<div id="${n}shellBody" style="height: 800px; width: 800px"> 
    <div id="${n}mapArea" style="background-color:green;height: 65%; width:100%"> <spring:message code="map.error.loading"/>
    </div>
    <div id="${n}textSpace" style="height: 5%; width:100%">
    </div>
    <div id="${n}infoArea" style="background-color:pink;height:30%; width:100%"> <spring:message code="body.instructions.search.words"/> <input id="${n}searchParamBox" autocomplete="off" type="text" size="10" name="search" title="search"/> 
        <p> <spring:message code="body.instructions.distance.optional"/> <input id="${n}distanceBox" autocomplete="off" type="text" size="10" name="Distance" title="search"/> <spring:message code="body.instructions.distance.explain"/>
           
           <p> <input id="${n}geoButton" type="radio" name="location" checked="checked" onclick="${n}.resetOrigin();" /> <spring:message code="body.radio.button.default"/>
           <p> <input id="${n}geoButton" type="radio" name="location" onclick="${n}.disableGeoLocation();" /> <spring:message code="body.radio.button.type"/> <input id="${n}originBox" autocomplete="on" type="text" size="10" name="Origin Address" title="yourLocation" onblur="${n}.typeOrigin();"/>
           <p> <input id="${n}geoButton" type="radio" name="location" onclick="${n}.geoLocationButton();" /> <spring:message code="body.radio.button.geoLocation"/>
        
        <p> <input id="${n}goButton" type="submit" value="search" onclick="${n}.clickSearch();" />
    </div>
</div> 
