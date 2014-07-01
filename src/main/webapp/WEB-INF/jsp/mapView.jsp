<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
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
<jsp:directive.include file="/WEB-INF/jsp/include.jsp"/>
<link href="<c:url value="/css/map.css"/>" rel="stylesheet" type="text/css" />
<portlet:defineObjects/>

<c:set var="n"><portlet:namespace/></c:set>
<c:set var="apiUrl">https://maps.googleapis.com/maps/api/js?sensor=true </c:set>
<c:if test="${ not empty apiKey }">
<c:set var="apiUrl">${ apiUrl }&amp;key=${ apiKey }</c:set>
</c:if>
<script src="${apiUrl}"></script>
<c:set var="usePortalJsLibs" value="${ false }"/>
<rs:aggregatedResources path="${ usePortalJsLibs ? '/skin-shared.xml' : '/skin.xml' }"/>
<script type="text/javascript"><rs:compressJs>
var ${n} = ${n} || {};
<c:choose>
    <c:when test="${!usePortalJsLibs}">
        ${n}.jQuery = jQuery.noConflict(true);
        ${n}.fluid = fluid;
        fluid = null; 
        fluid_1_4 = null;
    </c:when>
    <c:otherwise>
        <c:set var="ns"><c:if test="${ not empty portalJsNamespace }">${ portalJsNamespace }.</c:if></c:set>
        ${n}.jQuery = ${ ns }jQuery;
        ${n}.fluid = ${ ns }fluid;
    </c:otherwise>
</c:choose>
${n}.jQuery.mobile = up.jQuery.mobile;
if (!map.initialized) map.init(${n}.jQuery, ${n}.fluid, google);
${n}.map = map;

if(up.jQuery.mobile){
	up.jQuery(document).on("pagebeforecreate",function(event){
		up.jQuery('body').append('<link href="<c:url value="/css/mobile_map.css"/>" rel="stylesheet" type="text/css" />');
		up.jQuery('body').addClass('map_body');
		up.jQuery("<div data-role='panel' data-position='right' data-display='reveal' id='mypanel' data-theme='a' ><ul data-role='listview' data-inset='true' > \
			<li data-icon='grid'><a class='map-categories-link' data-rel='close' id='Categories' href='javascript:;'>Categories</a></li> \
			<li data-icon='bars'><a  class='map-campuses-link' data-rel='close' id='Campuses' href='javascript:;'>Campuses</a></li>  \
			<li data-icon='back'><a class='map-display-link' data-rel='close' href='javascript:;' >Map</a></li> \
			<li data-icon='delete'><a data-rel='close'  href='javascript:;' >Close</a></li> \
		</ul></div>").insertBefore('.map .portlet-wrapper-titlebar');
		up.jQuery('.map .portlet-wrapper-titlebar').attr('id','map_portlet_titlebar');
		up.jQuery('.map .portlet-wrapper-titlebar').attr('data-theme','a');
		up.jQuery('.map .portlet-wrapper-titlebar .title').remove();
		up.jQuery('.map .portlet-wrapper-titlebar>a').attr({'data-inline':'true','data-mini':'true','data-theme':'a','data-type':'horizontal'});
		up.jQuery('.map .portlet-wrapper-titlebar>a').removeAttr('data-direction');
		up.jQuery("<a href='javascript:;' id='titleShowSearch'  class = 'ui-btn-right' data-icon='search' data-iconpos='notext' data-mini='true' data-inline='true'  data-theme='c'  >Search</a> \
		<a href='#mypanel' id='panel_button' class='ui-btn-right' data-mini='true' data-inline='true' data-theme='c' data-iconpos='notext' data-icon='custom-panel-icon'>More</a>").insertAfter('.map .portlet-wrapper-titlebar>a');
		var before=up.jQuery('.map .portlet-wrapper-titlebar').html();
		up.jQuery('.map .portlet-wrapper-titlebar').html(before+"<h6 id='global_title' class='title'></h6>");
		
	});
} else {
	${n}.jQuery(document).ready(function () {
		${n}.jQuery('head').append('<link href="<c:url value="/css/desktop_map.css"/>" rel="stylesheet" type="text/css" />');
		${n}.jQuery("<li><a class='map-categories-link' id='Categories'  href='javascript:;'>Categories</a></li> \
		<li><a  class='map-campuses-link' id='Campuses'  href='javascript:;'>Campuses</a></li> \
		<li><a  id='Locate_me' href='javascript:;'>Locate me</a></li>\
		<div class='desktop' id='map-info'><h1 class='title'>Campus<h1></div>").insertAfter('.up-portlet-titlebar');
		${n}.jQuery('.map-display').height(600);
	});
}
${n}.jQuery(document).ready(function () { 
	
    var $ = ${n}.jQuery;
    $("#titleShowSearch").hide();
    mapOptions = {
    	defaultMapInfoHeader : '${defaultMapInfoHeader}',
    	mapdatarefreshdate :'${mapdatarefreshdate}',
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

    map.CampusMap($("#${n}map"), {
        defaultCoordinates: { latitude: ${ latitude }, longitude: ${ longitude } },
        location: '${ location }',
        mapOptions: mapOptions,
        mapDataUrl: '<portlet:resourceURL/>'
    });

	
});

</rs:compressJs></script>

<div id="${n}map" class="portlet"  data-role='content'> 
<!-- raise this up so that when it is shown/hidden the map underneath does not 'move'. Its jarring for the user and it causes any open infoWindows to vanish. 
Keep the position as 'absolute' else when results are chosen from the autocomplete candidate list they can push it off the screen, never to return-->
<div class="map-search-container" id='map_search_container'>
        <form class='map-search-form' > 
            <input  type='search' class='map-search-input' autocomplete='off' type='text' data-mini='true' size='10' name='search' title='search' placeholder='Search for a campus location'/> 
        </form>
</div>
<div id="search-dialog-modal" title="How to use the search box" style='display:none'>
  <p>Please choose a value from the autocomplete list. If this is empty please choose a different search term. Enter at least three characters.</p>
</div>
<div id='locate_me_holder' >
	<a  id='Locate_me'   data-role='button' data-icon='custom-locate-me' data-mini='true' data-inline='true' data-iconpos='notext' data-theme='b' href='javascript:;'>Locate me</a>
</div>

<div class="map-categories" id='map_categories'>
    
    <div class="portlet-content" data-role="content">
		
        <ul data-role="listview">
            <li class="map-category">
                <a href="javascript:;" class="map-category-link"><spring:message code="map.link.category.name"/></a>
            </li>
        </ul>
    </div>
</div>
<div class="map-location-detail portlet" id="map_location_detail" style="display:none">
    <div class="portlet" data-role="content">        
	    <h3 class="map-location-name"></h3>
	    <p class="map-location-description"></p>
	    <p class="map-location-address"></p>
		<div class="ui-grid-a">
	    <div class="ui-block-a map-location-directions-link "><a data-inline="true" data-mini="true" data-role="button" href="javascript:;"><spring:message code="map.link.directions"/></a></div>
	    <div class="ui-block-b map-location-map-link"><a data-inline="true" data-mini="true" data-role="button" href="javascript:;"><spring:message code="map.link.view.in.map"/></a></div>
	    </div>
		<p><img class="map-location-image"/></p>

	</div>
    
</div>
<div data-role='header' data-theme='b'  id='map-info'><h1 class='title'>Campus<h1></div>
<div class="map-container" id='map_container'>
        <div class="map-display" id="map_display" ></div>
</div>    

</div> 
