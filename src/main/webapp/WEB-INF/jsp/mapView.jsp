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
<c:set var="apiUrl">${ portalProtocol }://maps.google.com/maps/api/js?sensor=true</c:set>
<c:if test="${ not empty apiKey }">
    <c:set var="apiUrl">${ apiUrl }&amp;key=${ apiKey }</c:set>
</c:if>
<script src="${apiUrl}"></script>
<c:set var="usePortalJsLibs" value="${ true }"/>
<rs:aggregatedResources path="${ usePortalJsLibs ? '/skin-shared.xml' : '/skin.xml' }"/>



<script type="text/javascript">
if( typeof ${n} == 'undefined' ) ${n} = {};
${n}.mapPortlet= new MapPortlet(
    up.jQuery,
    up._,
    up.Backbone,
    window.google,
    {
        target : '#${n}map',
        template : '#N_map-template',
        root : 'http://map.dev/src/main/webapp/WEB-INF/jsp/map.html',
        data : '<portlet:resourceURL/>',
        mapOptions : {
            zoom: ${ zoom },
            mapTypeControl: ${ mapTypeControl },
            mapTypeControlOptions: {
                style: window.google.maps.MapTypeControlStyle.DEFAULT
            },
            panControl: ${ panControl },
            zoomControl: ${ zoomControl },
            zoomControlOptions: {
                style: window.google.maps.ZoomControlStyle.SMALL
            },
            scaleControl: ${ scaleControl },
            streetViewControl: ${ streetView },
            rotateControl: ${ rotateControl },
            overviewMapControl: ${ overviewControl },
            mapTypeId: window.google.maps.MapTypeId.ROADMAP
        }
    }
);
</script>


<!-- TEMPLATES -->
        
    <!-- MAIN LAYOUT -->
    <script type="layout" id="N_map-template">
        <div id="map-search-container"></div>
        <div id="map-search-results"></div>
        <div id="map-categories"></div>
        <div id="map-category-detail"></div>
        <div id="map-location-detail"></div>
        <div id="map-container"></div>
        <div id="map-footer"></div>
    </script>
    <!-- / MAIN LAYOUT -->
    
    <!-- MAP VIEW -->
    <script type="template" id="N_map-view-template">
        <div class="portlet-content" data-role="content">
            <div class="map-display" style="width:100%; height: 500px;"></div>
        </div>
    </script>
    <!-- / MAP VIEW -->

    <!-- MAP SEARCH FORM -->
    <script type="template" id="map-search-container-template">
        <div class="portlet-content" data-role="content">
            <form class="map-search-form" onsubmit="return false;">
                <input type="text" placeholder="Search" class="map-search-input" autocomplete="off" data-mini="true" size="10" name="search" title="search"/>
            </form>
        </div>
    </script>
    <!-- / MAP SEARCH FORM -->

    <!-- MAP SEARCH -->
    <script type="template" id="map-search-results-template">
        <div class="portlet-content" data-role="content">
            <ul data-role="listview">
                <li class="map-search-result">
                    <a href="javascript:;" class="map-search-result-link"></a>
                </li>
            </ul>
        </div>
    </script>
    <!-- / MAP SEARCH -->

    <!-- MAP CATEGORIES -->
    <script type="template" id="map-categories-template">
        <div class="portlet-content" data-role="content">
            <ul data-role="listview">
                {! _.each(categories, function (i, cat) { !}
                <li class="map-category">
                    <a href="javascript:;" class="map-category-link" data-category='{{ cat }}'>{{ cat }}</a>
                </li>
                {! }); !}
            </ul>
        </div>
    </script>
    <!-- / MAP CATEGORIES -->

    <!-- MAP CATEGORY -->
    <script type="template" id="map-category-detail-template">
        <div data-role="header" class="titlebar portlet-titlebar search-back-div">
            <h2 class="map-category-name">
                <a data-role="button" data-icon="back" data-inline="true" class="map-category-back-link" href="javascript:;">Back</a>
                {{ categoryName }}
            </h2>
        </div>

        <div class="portlet">
            <div class="portlet-content" data-role="content">
                <ul data-role="listview">
                    {! locations.each( function (location) { !}
                    <li class="map-location">
                        <a href="javascript:;" class="map-location-link" data-locationid="{{ location.get('id') }}">{{ location.get('name') }}</a>
                    </li>
                    {! }); !}
                </ul>
            </div>
        </div>
    </script>
    <!-- / MAP CATEGORY -->

    <!-- MAP LOCATION -->
    <script type="template" id="map-location-detail-template">
        <div data-role="header" class="titlebar portlet-titlebar search-back-div">
            <h2 class="map-location-name">
                <a data-role="button"  data-icon="back" data-inline="true" class="map-location-back-link" href="javascript:;">Back</a>
                {{ location.name }}
            </h2>
        </div>

        <div class="portlet">
            <div class="portlet-content" data-role="content">
                <h3 class="map-location-name">{{ location.name }}</h3>
                <p class="map-location-description">{{ location.description != null ? location.description : '' }}</p>
                <p class="map-location-address">{{ location.address }}</p>
                <p>
                    <a href="http://maps.google.com?q={{ encodeURI( location.address ? location.address : location.latitude + ',' + location.longitude ) }}" class="map-location-directions-link" target="javascript:;">Directions</a>
                </p>
                {! if( location.latitude != null && location.longitude != null ) { !}
                    <p><a class="map-location-map-link" href="javascript:;">View in Map</a>
                {! } !}
                {! if( location.img ) { !}
                    <p><img class="map-location-image" src="{{ location.img }}"/></p>
                {! } !}
            </div>
        </div>
    </script>
    <!-- / MAP LOCATION -->

    <!-- MAP FOOTER -->
    <script type="template" id="map-footer-template">
        <div data-role="footer" data-position="fixed">
            <div data-role="navbar">
                <ul>
                    <li><a class="map-footer-search-link" href="javascript://" class="ui-btn-active">Search</a></li>
                    <li><a class="map-footer-browse-link" href="javascript://">Browse</a></li>
                </ul>
            </div>
        </div>
    </script>
    <!-- / MAP FOOTER -->

<!-- / TEMPLATES -->

<div id="${n}map" class="portlet"></div>
