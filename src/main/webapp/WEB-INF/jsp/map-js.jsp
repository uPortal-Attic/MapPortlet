<script type="text/javascript">

var mapOptions;
var map;
var mapStreetView;
var model;
var lastCategoryOpen;
var allMarkers = [];
var infoWindow = null;
var isStreetView = false;
var mapDataUrl = "/MapPortlet/data/map.json";

//Ensures a unique namespace for jQuery
var mapPortlet = mapPortlet || {};
mapPortlet["${n}"] = mapPortlet["${n}"] || {};
mapPortlet["${n}"].jQuery = jQuery.noConflict(true);

(function($) {
    $(document).ready(function () { 
        mapOptions = {
            center: new google.maps.LatLng(${ latitude }, ${longitude}),
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
    });

    //Menu switch functionality
    $("#${n}map .menu-switch").click(function() {
        if ($("#${n}map .menu-content").is(":hidden")) {
            $("#${n}map .rise").hide();
            $("#${n}map .collapse").show();
            $("#${n}map .menu-switch").addClass("collapse-active");
            $("#${n}map .menu-content").show(250);
        } else {
            hideMenu();
        }
    });

    $("#${n}map .small-map-arrow").click(function() {
        hideMenu();
    });

    //Handles page dimming for image preview on desktop version 
    $("#${n}map .page-dim, #${n}map .exit-viewer").click(function(event) {
        $("#${n}map .popup-viewer").toggleClass("toggle-hidden");
    });

    $(document).on("input", "#search-input", function() {
        searchLocation();
    });

    //Clears search box on desktop and mobile
    $("#${n}map #search-clear").click(function(event) {
        $("#search-input").val("");
        $("#search-input").focus();
        searchLocation();
    });

    //INIT THE MAP
    google.maps.event.addDomListener(window, "load", initialize);

    //Map initialization
    function initialize() {
        map = new google.maps.Map(document.getElementById("map-display"),
        mapOptions);

        mapStreetView = map.getStreetView();

        google.maps.event.addListener(mapStreetView, "visible_changed", function() { 
            isStreetView = (mapStreetView.getVisible());
        });
    }

    /**
     * Retrieve the list of map locations via AJAX.
     */
    $.getJSON(mapDataUrl, function(json) {
        model = json;
        model.categories = [];

        //Cycles through the categories and sorts specific locations
        //into an array that is linked to the category name
        $(model.locations).each(function (idx, location) {
            $(location.categories).each(function (idx, category) {

                //Creates a marker for each unique location
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(location.latitude, location.longitude),
                    map: map,
                    title: location.name
                });

                //Adds the category names, and their associated locations and markers
                if (!model.categories[category]){
                    model.categories.push( {name: category, locations: [], markers: [] });
                    model.categories[category] = model.categories[model.categories.length-1];
                }
                model.categories[category].locations.push(location.name);
                model.categories[category].markers.push(marker);
                allMarkers.push(marker);

                //Adds click event for markers
                google.maps.event.addListener(marker, "click", function() {
                    showInfoWindow(marker, location.name, location.abbreviation, location.description, location.img);
                });

                clearMap();
            });
        });

        //Creates the accordion menu that contains the categories and locations
        $(model.categories).each(function(idx, category) {
            $(".category-list").append("<li class='map-category' id='map-category-" + category.name + "'>" +
            "<h3 class='map-category-header' id='" + category.name + "'>" + category.name + 
            "</h3></li>");

            $("#map-category-" + category.name).append("<ul class='location-list' id='location-list-" + category.name + "'></ul>");
            $(category.locations).each(function(idx, location) {
                $("#location-list-" + category.name).append("<li class='map-location' id='map-location-" +
                  location + "'>" + location + "</li>");
            });
        });

        $("#accordion").accordion({ 
            header: "h3", 
            collapsible: true,
            active: false,
            autoHeight: false,
            clearStyle: true
        });

        //Clicking a category
        $("#accordion").on("accordionchange", function(event, ui) {
            if (ui.newHeader.length > 0) {
                lastCategoryOpen = ui.newHeader.context.textContent;
                showCategoryMarkers(lastCategoryOpen);
            } else {
                lastCategoryOpen = "";
                clearMap();
                centerMap();
            }
        });

        //Clicking a location
        $(".map-location").click(function(event) {
            showLocationMarker(lastCategoryOpen, event.currentTarget.textContent);
            $(this).toggleClass("map-location-selected");
            if ($(".menu-content").hasClass("small-map")) { hideMenu(); }
        });
    });

    //Center the map and adjust zoom level
    function centerMap() {
        map.setCenter(mapOptions.center);
        map.setZoom(14);
    }

    //Shows all markers for a clicked category
    function showCategoryMarkers(categoryId) {
        var limits = new google.maps.LatLngBounds();
        clearMap();
        $(model.categories[categoryId].markers).each(function(idx, marker) {
            marker.setMap(map);
            limits.extend(marker.position);
        });

        map.fitBounds(limits);
        var currentZoom = map.getZoom();
        map.setZoom(currentZoom > 16 ? 16 : currentZoom);
    }

    //Shows the marker and info window of a clicked location
    function showLocationMarker(categoryId, locationId) {
        var description = "";
        var abbreviation = "";
        var image = "";
        var tempLatLng = "";

        clearMap();

        var markerIndex = model.categories[categoryId].locations.indexOf(locationId);
        var marker = model.categories[categoryId].markers[markerIndex]; 
        marker.setMap(map);
        map.setZoom(16);

        $(model.locations).each(function(idx, location) {
            if (locationId === location.name) {
                description = location.description;
                abbreviation = location.abbreviation;
                image = location.img;
                tempLatLng = new google.maps.LatLng(location.latitude, location.longitude); 
                return false;
            }
        });

        showInfoWindow(marker, locationId, abbreviation, description, image);

        //Support for menu function in Street View
        var streetViewService = new google.maps.StreetViewService();  
        var radius = 50;

        if (isStreetView) {
           mapStreetView.setPosition(tempLatLng);
           streetViewService.getPanoramaByLocation(tempLatLng, radius, getNearestStreetView);
        }

        function getNearestStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.LatLng;
            } else {
                radius += 50;
                streetViewService.getPanoramaByLocation(tempLatLng, radius, getNearestStreetView);
            }
        };
    }

    //Clears markers from the map
    function clearMap() {
        $(".map-location").toggleClass("map-location-selected", false);
        $(".search-location").toggleClass("map-location-selected", false);
        if (infoWindow) {
            infoWindow.close();
        }
        for (var i = 0; i < allMarkers.length; i++) {
            allMarkers[i].setMap(null);
        }
    }

    //Populates an InfoWindow and closes any previously opened InfoWindows
    function showInfoWindow(marker, name, abbreviation, description, image) {
        if (infoWindow) {
            infoWindow.close();
        }

        infoWindow = new google.maps.InfoWindow({
            content: "<div class='info-window'><span>" + name + " (" + abbreviation + ")</span><p><a href='" +
            description + "' target='_blank'>Read More</a></p>" + 
            "<div class='image-container'><img class='location-image' src='" + image + "'></img><img class='magnify-icon '" +
            "src='\/MapPortlet\/img\/icon_magnify_glass.png'></img></div></div>"
        });

        if (isStreetView) {
            infoWindow.open(mapStreetView, marker);
        } else {
            infoWindow.open(map, marker);
        }

        map.panTo(marker.getPosition());
        map.panBy(100,0);

        //The domready event for InfoWindows fires twice 
        var domReadyOnce = false;

        google.maps.event.addListener(infoWindow, "domready", function() {
            if (!domReadyOnce) {
                //Hides image if link is broken
                $(".location-image").error(function(){
                    $(this).hide();
                    $(".magnify-icon").hide();
                });
                //View larger image
                $(".magnify-icon").click(function(event) {
                    var largeImage = image.replace("thumbnails", "large");
                    $(".image-large").attr("src", largeImage);
                    $(".popup-viewer").toggleClass("toggle-hidden", false);
                });

                if ($(".menu-content").hasClass("small-map")) { 
                    $(".magnify-icon").hide();
                    $(".location-image").css("cursor", "pointer");
                    var largeImage = image.replace("thumbnails", "large");
                    $(".location-image").click(function(event) {
                        window.open(largeImage);
                    });
                }

            domReadyOnce = true;
            }
        });
    }

    //Hides the menu for mobile views
    function hideMenu() {
        $("#${n}map .rise").show();
        $("#${n}map .collapse").hide();
        $("#${n}map .menu-content").hide(250);
        $("#${n}map .menu-switch").removeClass("collapse-active");
    }

    //Search functionality
    function searchLocation() {
        currentText = ($("#search-input")[0].value).toUpperCase();
        $(".search-ul").html("");
        $("#search-clear").toggleClass("toggle-hidden", true);
        if (currentText.length > 0) {
            $("#search-clear").toggleClass("toggle-hidden", false);
            $(".search-ul").append("Results: ");
            $(model.locations).each(function (idx, location) {
                var locationName = (location.name).toUpperCase();
                if (locationName.indexOf(currentText) > -1 || (location.abbreviation).indexOf(currentText) > -1) {
                    $(".search-ul").append("<li class='search-location'>" + location.name + "</li>");
                }
            });
            if (!$(".search-ul").find(".search-location").length) {
                $(".search-ul").append("<li class='no-results'>No results found</li>");
            }
        }

        $(".search-location").click(function(event) {
            tempLocation = event.target.textContent;
            tempCategory = "";

            $(".search-location").toggleClass("map-location-selected", false);
            $(model.categories).each(function (idx, category) {
                if ($.inArray(tempLocation, category.locations) != -1) {
                    tempCategory = category.name;
                    return false;
                }
            });

            showLocationMarker(tempCategory, tempLocation);
            $(this).toggleClass("map-location-selected");
            if ($(".menu-content").hasClass("small-map")) { hideMenu(); }
        });
    }
})(mapPortlet["${n}"].jQuery);
</script>
