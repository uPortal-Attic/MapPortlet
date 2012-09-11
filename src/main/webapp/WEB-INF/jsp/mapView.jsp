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
<style type="text/css">

        /* TODO: Move into stylesheet */


    .map-search-results.out, .map-categories.out, .map-category-detail.out, .map-location-detail.out {
        position:absolute;
        top:0;
        width:100%;
    }
    .map-location-detail {
        background-color:#fff;
    }
    
    
    
    .map-portlet {
        position: relative;
        margin-bottom:-57px;
    }
    
    .map-portlet .map-list-tray {
        
    }

    .map-portlet .map-search-results {
        background-color:#fff;
    }
    .map-portlet .map-categories {
        background-color:#fff;
    }
    .map-portlet .map-category-detail {
        background-color:#fff;
    }
    .map-portlet .map-location-detail {
        background-color:#fff
    }
    
    .map-portlet .map-fullscreen {
        position:fixed;
        top:0;
        left:0;
        right:0;
        bottom:0;
        z-index:0;
    }
    .map-portlet .ui-bar { text-align: center; }
    .map-portlet .ui-bar a.ui-btn { float: left; }
    .map-portlet .map-box { 
        border: 1px solid gray;
        padding: 2em;
    }
    .map-portlet .map-box h3 {
        margin:0;
    }
    .map-portlet .map-box + .map-box {
        margin-top:2em;
    }
    .map-portlet .map-location-image {
        text-align:center;
    }
    .map-portlet #map-search-form .map-search-form {
        position: relative;
    }
    .map-fullscreen .portlet-content {
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
    }
    .map-portlet .map-display {
        width:100%;
        height: 100%;
    }
    .map-portlet .map-centered-buttons {
        text-align:center
    }
    .map-portlet .map-centered-buttons div {
        width:100%
    }
    .map-portlet .ui-btn-up-c {
        border-color: #08180f;
        background: #21653f;
        color: white;
        background-image: -moz-linear-gradient(top, #21653f, #08180f);
        background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #21653f), color-stop(1, #08180f));
        -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorStr='#21653f', EndColorStr='#08180f')";
    }
    .map-portlet .ui-btn-hover-c {
        border-color: #08180f;
        background: #2e8b57;
        color: white;
        background-image: -moz-linear-gradient(top, #2e8b57, #143f27);
        background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #2e8b57), color-stop(1, #143f27));
        -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorStr='#2e8b57', EndColorStr='#143f27')";
    }
    .map-portlet #map-footer .map-footer {
        
    }
</style>


<!-- TEMPLATES -->
        
    <!-- MAIN LAYOUT -->
    <script type="layout" id="N_map-template">
        <div class="map-fullscreen">
            <div id="map-container"></div>
        </div>
        <div id="map-search-form"></div>
        <div class="map-list-tray">
            <div id="map-search-results"></div>
            <div id="map-categories"></div>
            <div id="map-category-detail"></div>
            <div id="map-location-detail"></div>
        </div>
        <div id="map-footer"></div>
    </script>
    <!-- / MAIN LAYOUT -->
    
<style type="text/css">
    /*
    .map-fullscreen.map-show-search .portlet-content, .map-fullscreen .map-show-title .portlet-content {
        top:0;
    }
    */
    .map-search {
        display:none;
        background-color:#fff;
    }
    .map-show-search .map-search {
        display:block;
    }
    .map-title {
        display:none;
        background-color:#fff;
    }
    .map-show-title .map-title {
        display:block;
    }
</style>

    <!-- MAP VIEW -->
    <script type="template" id="map-view-template">
        <div class="portlet-content" data-role="content">
            <div class="map-display"></div>
        </div>
    </script>
    <!-- / MAP VIEW -->

    <!-- MAP SEARCH FORM -->
    <script type="template" id="map-search-form-template">
        <div class="portlet-content map-search" data-role="content">
            <form class="map-search-form" onsubmit="return false;">
                <input type="text" placeholder="Search" class="map-search-input" autocomplete="off" data-mini="true" size="10" name="search" title="search" value="{{ typeof query != 'undefined' ? query : '' }}"/>
            </form>
        </div>
        <div data-role="header" class="portlet-titlebar ui-bar map-title">
            <h2 class="map-category-name">
                {{ title }}
            </h2>
        </div>
    </script>
    <!-- / MAP SEARCH FORM -->

    <!-- MAP SEARCH RESULTS -->
    <script type="template" id="map-search-results-view-template">
        <div class="portlet-content" data-role="content">
            <ul data-role="listview">
                {! _.each(results, function (result) { !}
                    <li class="map-search-result">
                        <a class="map-search-result-link" data-locationid='{{ result.id }}'>{{ result.name }}</a>
                    </li>
                {! }); !}
            </ul>
        </div>
    </script>
    <!-- / MAP SEARCH RESULTS -->

    <!-- MAP CATEGORIES -->
    <script type="template" id="map-categories-template">
        <div data-role="header" class="portlet-titlebar ui-bar">
            <h2 class="map-category-name">
                Categories
            </h2>
        </div>
        <div class="portlet-content" data-role="content">
            <ul data-role="listview">
                {! _.each(categories, function (i, cat) { !}
                <li class="map-category">
                    <a class="map-category-link" data-category='{{ cat }}'>{{ cat }}</a>
                </li>
                {! }); !}
            </ul>
        </div>
    </script>
    <!-- / MAP CATEGORIES -->

    <!-- MAP CATEGORY -->
    <script type="template" id="map-category-detail-template">
        <div data-role="header" class="portlet-titlebar ui-bar">
            <h2 class="map-category-name">
                {{ categoryName }}
            </h2>
        </div>

        <div class="portlet">
            <div class="portlet-content" data-role="content">
                <ul data-role="listview">
                    {! locations.each( function (location) { !}
                    <li class="map-location">
                        <a class="map-location-link" data-locationid="{{ location.get('id') }}">{{ location.get('name') }}</a>
                    </li>
                    {! }); !}
                </ul>
            </div>
        </div>
    </script>
    <!-- / MAP CATEGORY -->

    <!-- MAP LOCATION -->
    <script type="template" id="map-location-detail-template">
        <div data-role="header" class="portlet-titlebar ui-bar">
            <h2 class="map-location-namemap-category-name">
                {{ location.name }}
            </h2>
        </div>

        <div class="portlet ui-content">
            <div class="portlet-content map-box ui-corner-all ui-shadow" data-role="content">
                <h3 class="map-location-name">{{ location.name }}</h3>
                <p class="map-location-description">{{ location.description != null ? location.description : '' }}</p>
                <p class="map-location-address">{{ location.address }}</p>
                <div data-role="controlgroup" data-type="horizontal" class="map-centered-buttons">
                    {! if( location.latitude != null && location.longitude != null ) { !}
                        <a class="map-location-map-link" data-role="button">Map</a>
                    {! } !}
                    <a href="http://maps.google.com?q={{ encodeURI( location.address ? location.address : location.latitude + ',' + location.longitude ) }}"
                       class="map-location-directions-link" target="javascript:;" data-role="button">Directions</a>
                </div>
            </div>

            {! if( location.img ) { !}
                <div class="portlet-content map-box ui-corner-all ui-shadow">
                    <div class="map-location-image"><img class="map-location-image" src="{{ location.img }}"/></div>
                </div>
            {! } !}
        </div>
    </script>
    <!-- / MAP LOCATION -->

    <!-- MAP FOOTER -->
    <script type="template" id="map-footer-template">
        <div data-role="footer" data-position="fixed" class="portlet-wrapper-titlebar map-footer">
            <div data-role="navbar" data-iconpos="top">
                <ul>
                    <li>
                        <a data-icon="back" class="map-footer-back-link">Back</a>
                    </li>
                    <li>
                        <a data-icon="search" class="map-footer-search-link">Search</a>
                    </li>
                    <li>
                        <a data-icon="grid" class="map-footer-browse-link">Categories</a>
                    </li>
                    <li>
                        <a data-icon="map" class="map-footer-map-link">Map</a>
                    </li>
                </ul>
            </div>
        </div>
    </script>
    <!-- / MAP FOOTER -->

<!-- / TEMPLATES -->

<div id="${n}map" class="portlet map-portlet"></div>
