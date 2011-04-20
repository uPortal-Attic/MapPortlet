<%--

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

--%>

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

<c:set var="n"><portlet:namespace/></c:set>
<c:set var="context" value="${pageContext.request.contextPath}"/>
<script src="${ isHttps ? 'https' : 'http' }://maps.google.com/maps/api/js?sensor=true"></script>
<script src="<rs:resourceURL value="/rs/jquery/1.5/jquery-1.5.min.js"/>" type="text/javascript"></script>
<script src="<c:url value="/js/map-helper.min.js"/>" type="text/javascript"></script>

<script type="text/javascript"><rs:compressJs>
    var ${n} = ${n} || {};
    ${n}.jQuery = jQuery.noConflict(true);
    ${n}.google = google || {};
    ${n}.google.maps = google.maps || {};

    ${n}.jQuery(document).ready(function () { 

        var $ = ${n}.jQuery;
        var google = ${n}.google;
        
        var map, infoWindow, mapOptions, currentLocation;

        var initializeMap = function() {

            mapOptions = {
                zoom: ${ zoom },
                mapTypeControl: ${ mapTypeControl },
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DEFAULT
                },
                panControl: ${ panControl },
                zoomControl: ${ zoomControl },
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL
                },
                scaleControl: ${ scaleControl },
                streetViewControl: ${ streetView },
                rotateControl: ${ rotateControl },
                overviewMapControl: ${ overviewControl },
                mapTypeId: google.maps.MapTypeId.ROADMAP

            };

            infoWindow = new google.maps.InfoWindow();
            map = new google.maps.Map($("#${n}mapArea").get(0), mapOptions); 

            map.setTilt(${ rotateControl } ? 45 : 0); 
            
            currentLocation = new google.maps.LatLng(${ latitude }, ${ longitude });
            map.setCenter(currentLocation);
            
        };

        var search = function() {
            var query = $("#${n}searchParamBox").val();
            mapHelper.search(map, infoWindow, query, currentLocation);
            return false;
        };

        $("#${n}searchForm").submit(search);

        initializeMap();
        
    });

</rs:compressJs></script>

<div> 
    <div id="${n}mapArea" style="height: 500px; margin-bottom: 10px"> 
        <spring:message code="map.data.unavailable"/>
    </div>
    <form id="${n}searchForm">
        <p>
            <c:set var="input"><input id="${n}searchParamBox" autocomplete="off" type="text" size="10" name="search" title="search"/></c:set> 
            <spring:message code="search.for.name.within.number.miles" arguments="${ input }"/> 
            <input id="${n}goButton" type="submit" value="Go"/> 
        </p>
    </form>
</div> 
