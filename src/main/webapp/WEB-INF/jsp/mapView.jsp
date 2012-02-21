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
<portlet:defineObjects/>

<c:set var="n"><portlet:namespace/></c:set>
<c:set var="apiUrl">${ isHttps ? 'https' : 'http' }://maps.google.com/maps/api/js?sensor=true</c:set>
<c:if test="${ not empty apiKey }">
    <c:set var="apiUrl">${ apiUrl }&amp;key=${ apiKey }</c:set>
</c:if>
<script src="${apiUrl}"></script>
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
    if (!map.initialized) map.init(${n}.jQuery, ${n}.fluid, google);
    ${n}.map = map;

    ${n}.jQuery(document).ready(function () { 

        var $ = ${n}.jQuery;
        
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

        map.view($("#${n}map"), {
            defaultCoordinates: { latitude: ${ latitude }, longitude: ${ longitude } },
            location: '${ location }',
            mapOptions: mapOptions,
            mapDataUrl: '<portlet:resourceURL/>'
        });
    });

</rs:compressJs></script>

<div id="${n}map"> 
    <form class="map-search-form">
        <input class="map-search-input" autocomplete="off" type="text" size="10" name="search" title="search"/> 
    </form>
    <div class="map-display" style="height: 500px; margin-bottom: 10px">
    </div>
</div> 
