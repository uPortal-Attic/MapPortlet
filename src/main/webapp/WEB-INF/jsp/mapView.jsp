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
<portlet:defineObjects/>

<c:set var="n"><portlet:namespace/></c:set>
<c:set var="apiUrl">https://maps.google.com/maps/api/js?sensor=true</c:set>
<c:if test="${ not empty apiKey }">
    <c:set var="apiUrl">${ apiUrl }&amp;key=${ apiKey }</c:set>
</c:if>

<script src="${apiUrl}"></script>
<c:set var="usePortalJsLibs" value="${ false }"/>
<rs:aggregatedResources path="${ usePortalJsLibs ? '/skin-shared.xml' : '/skin.xml' }"/>

<div id="${n}map" class="portlet"> 
    <div id="map-container">
        <div class="portlet-content" data-role="content">
            <div class="menu" id="map-menu">
                <div class="popup-viewer toggle-hidden">
                    <div class="popup">
                        <div class="page-dim"></div>
                        <div class="popup-image">
                            <img class="image-large"></img>
                            <span class="exit-viewer">&#10006;</span>
                        </div>
                    </div>
                </div>
                <div class="menu-content">
                    <div class="menu-search">
                        <input id="search-input"
                            type="search"
                            placeholder="Search..."
                            autocomplete=off />
                        <span id="search-clear" class="toggle-hidden glyphicon glyphicon-remove-circle"></span>
                        <ul class="search-ul">
                        </ul>
                        <hr>
                    </div>
                    <div class="small-map-arrow hidden">
                        <span class="glyphicon">></span>
                        </br>
                        <span class="hide-text">hide</span>
                    </div>
                    <ul class="category-list" id="accordion" data-role="listview"></ul>
                </div>
                <div class="menu-switch">
                    <span class="rise glyphicon"><</span> 
                    <span class="collapse glyphicon">></span> 
                </div>
            </div>
            <div class="map-display" id="map-display"></div>
        </div>
    </div>    
</div>

<script type="text/javascript">
    $(function(){
        var $window = $(window);

        function resize() {
            var panel = $('#map-container');
            var width = panel.width();
            if(width < 400) {
                panel.find('.menu-content').addClass('small-map');
                panel.find('.menu-switch').addClass('small-map');
                panel.find('.map-display').addClass('small-map');
                panel.find('.small-map-arrow').removeClass('hidden');
            } else {
                panel.find('.menu-content').removeClass('small-map');
                panel.find('.menu-switch').removeClass('small-map');
                panel.find('.map-display').removeClass('small-map');
                panel.find('.small-map-arrow').addClass('hidden');
            }
        }

        resize();

        $window
            .resize(resize)
            .trigger('resize');
    });
</script>

<jsp:directive.include file="/WEB-INF/jsp/map-js.jsp"/>

<!--[if lte IE 8]>
    <div class="ie-warning" style="font-size: 14px;padding: 5px;text-align: center;">
        <spring:message code="ie.warning"/>
    </div>
    <script type="text/javascript">
        document.getElementById("map-menu").style.display = "none";
    </script>
<![endif]-->

<!--[if IE]>
    <style type="text/css">
        #${n}map .popup {
            -ms-transform: translate(0%, 0%) !important;
            transform: translate(0%, 0%) !important;
            left: 0 !important;
        }

        #${n}map .popup-image {
            top: 0 !important;
            -ms-transform: translate(0%, 0%) !important;
            transform: translate(0%, 0%) !important;
        }
    </style>
<![endif]-->

<style type="text/css">

    #${n}map .portlet-content {
        padding: 0 !important;
    }

    #${n}map .menu-content {
        display: none;
        float: right;
        position: relative;
        height: 500px;
        width: 260px;
        z-index: 10;
        background-color: rgba(204, 204, 204, 0.9);
        padding: 0 10px;
        margin-right: 0;
        overflow-y: auto !important;
        -webkit-box-shadow: -8px 0px 5px -5px rgba(0,0,0,0.15);
        -moz-box-shadow: -8px 0px 5px -5px rgba(0,0,0,0.15);
        box-shadow: -8px 0px 5px -5px rgba(0,0,0,0.15);
    }

    #${n}map .menu-content.small-map {
        width: 100% !important; 
    }
    #${n}map .menu-search {
        padding: 10px;
    }

    #${n}map #search-input {
        width: 100%;
        padding: 2px;
    }

    #${n}map #search-clear {
        position: relative;
        float: right;
        top: -22px;
        left: -8px;
        cursor: pointer;
    } 

    #${n}map .no-results {
        font-style: italic;
        text-align: center;
    }

    #${n}map .popup-viewer {
        display: block;
        position: relative;
    }

    #${n}map .toggle-hidden {
        display: none !important;
    }

    #${n}map .page-dim {
        background: rgba(0, 0, 0, 0.5);
        position: absolute;
        width: 100%;
        height: 500px;
        z-index: 100;
    }

    #${n}map .popup {
        position: absolute;
        width: 100%;
        height: 500px;
        -ms-transform: translate(-50%, 0%);
        -webkit-transform: translate(-50%, 0%);
        transform: translate(-50%, 0%);
        left: 50%;
        z-index: 100;
        text-align: center;
    }

    #${n}map .popup-image {
        display: inline-block;
        position: relative;
        width: auto;
        padding: 0 15px;
        top: 50%;
        -ms-transform: translate(0%, -50%);
        -webkit-transform: translate(0%, -50%);
        transform: translate(0%, -50%);
        z-index: 101;
    }

    #${n}map .image-large {
        width: 100%;
        max-width: 720px;
        max-height: 480px;
        height: auto;
        -webkit-box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
    }

    #${n}map .exit-viewer {
        background: rgba(0, 0, 0, 0.7);
        color: #FFF;
        font-size: 2em;
        padding: 0px 10px;
        border-radius: 5px;
        position: absolute;
        top: 10px;
        right: 25px;
        opacity: 0.85;
        cursor: pointer;
    }

    #${n}map .exit-viewer:hover, .magnify-icon:hover {
        opacity: 1 !important;
    }

    #${n}map .menu-content > .category-list {
        width: auto;
    }

    #${n}map ul li {
        list-style-type: none;
    }

    #${n}map .ui-accordion-content-active {
        background: none;
        border: none;
        padding: 10px !important;
    }

    #${n}map .search-ul {
        padding: 0 !important;
        margin-top: 5px;
    }

    #${n}map .map-category-header, .search-location, .map-location {
        background: none repeat scroll 0% 0% #F2F2F2;
        padding: 10px 5px;
        border-radius: 4px;
        margin: 3px 0;
        text-align: center;
        cursor: pointer;
        line-height: 1;
    }

    #${n}map .map-category-header:hover, .map-location:hover, 
    .search-location:hover, .map-location-selected {
        background: #FFF;
    }

    #${n}map .map-category-header .ui-icon {
        float: left;
    }

    #${n}map .location-list {
        line-height: 1.5;
        width: auto !important;
        font-size: 14px;
    }

    #${n}map .info-window {
        display: inline-block;
        margin-bottom: 0px;
        white-space: nowrap;
    }

    #${n}map .image-container {
        margin-top: 5px;
        display: inline-block;
    }

    #${n}map .location-image {
        width: 200px;
        height: 133px;
        float: right;
    }

    #${n}map .magnify-icon {
        left: 193px;
        top: 102px;
        position: relative;
        float: right;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 3px;
        padding: 0px 1px;
        margin-top: 1px;
        opacity: 0.85;
    }

    #${n}map .menu-switch {
        display: block;
        z-index: 11;
        position: relative;
        padding: 10px;
        font-size: 40px;
        float: right;
        margin-top: 200px;
        background: #FFF;
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
        transition-duration: 1s;
        cursor: pointer;
        -webkit-box-shadow: -5px 0px 5px 0px rgba(0,0,0,0.15);
        -moz-box-shadow: -5px 0px 5px 0px rgba(0,0,0,0.15);
        box-shadow: -5px 0px 5px 0px rgba(0,0,0,0.15);
    }

    #${n}map .menu-switch .glyphicon {
        line-height: inherit !important;
        top: -5px !important;
    }

    #${n}map .collapse {
        display: none;
    }
    
    #${n}map .menu-switch.small-map.collapse-active {
        display: none;
    }

    #${n}map .small-map-arrow {
        background: #fff;
        width: 40%;
        height: 75px;
        margin-right: auto;
        margin-left: auto;
        margin-bottom: 28px;
        text-align: center;
        border-radius: 6px; 
        cursor: pointer;
    }

    #${n}map .small-map-arrow span {
       font-size: 40px;
        line-height: 1; 
        left: 3px;
    }

    #${n}map .small-map-arrow .hide-text {
        font-size: 1em;   
    }

    #${n}map #map-display {
        width: 100%;
        height: 500px;
        overflow: visible !important;
    }

    #${n}map .menu ::-webkit-scrollbar {
        -webkit-appearance: none;
        width: 7px;
    }   

    #${n}map .menu ::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(0,0,0,.5);
        -webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);
    }

    #${n}map .map-display .gm-style-iw div { 
        overflow: hidden !important;
        text-align: center !important;
        white-space: pre-wrap !important;
    }

    #${n}map .map-display.small-map .gm-style-iw div { 
        width: 100%;
    }

    #${n}map .hidden {
        display: none;
    }
</style>
