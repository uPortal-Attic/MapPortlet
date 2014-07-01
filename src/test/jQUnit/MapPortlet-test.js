(function ($) {
$(document).ready (function () {
    "use strict";
	 var setupGeoLocationStubs;
    jqUnit.module("MapPortlet Tests");

	var CampusMap = null;
    var json = null;
    var jsonAsString =null;
    var mapOptions = {
        zoom: 11,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DEFAULT
        },
        panControl:false,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        overviewMapControl: false,
        mapdatarefreshdate:'aaa',
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
     var setupCampusMap = (function() {
        var makeNewCampusMap  = function() {
             //need to clear out old data/jQuery Google maps plugin functions each time we re-initialise the map
            if(CampusMap){
                //destroys that jQuery Google maps plugin  - we have to do this so that we can reference a new one in our new map object
                CampusMap.MapView.map.destroy();
                // remove functions from the jQuery google maps plugin cached as data objects against the map dom
                var mapEl= $('div.map-display').get(0);
                $.removeData(mapEl,"gmap");
            }
            map.init(jQuery,fluid, google);
            var _CampusMap = map.CampusMap(jQuery('#test_map'), {
                 defaultCoordinates: { latitude: 22, longitude: 23 },
                 location: '',
                 mapOptions: mapOptions,
                 mapDataUrl: 'testUrl'
             });
             CampusMap=_CampusMap;
         };

         /* I dont think we can do this test properly without upgrading to a later version of fluid.
         This 'workaround....' allows stubbing of the fluid components - stub the fluid creator function and make it return the
         * already existing fluid component for the *previous* MapView:- CampusMap.MapView. We can now stub any of CampusMap.MapView's functions in our
         * tests *prior* to calling this function - see the test 'MapView refreshView is called during setup of map' for an example */
        var reusePreviousCampusMap = function(){
             map.init(jQuery,fluid, google);
            var mapViewCreatorStub= sinon.stub(map,"MapView");
             mapViewCreatorStub.returns(CampusMap.MapView);
             var _CampusMap = map.CampusMap(jQuery('#test_map'), {
                 defaultCoordinates: { latitude: 22, longitude: 23 },
                 location: '',
                 mapOptions: mapOptions,
                 mapDataUrl: 'testUrl'
             });
             mapViewCreatorStub.restore();
             return _CampusMap;
         };
         return {
             makeNewCampusMap:makeNewCampusMap,
             reusePreviousCampusMap:reusePreviousCampusMap
         };
	 }());
    var localStorageStub= sinon.stub(localStorage,"getItem");
    var ajaxStub = sinon.stub($,"get");
    var setUpJson = function(){
        json = {"mapData": {
            "locations": [
                {
                    "name": "New College",
                    "abbreviation": "new-college",
                    "campuses": ["Central"],
                    "categories": ["Buildings"],
                    "longitude": "-3.1952404975891113",
                    "latitude": "55.9496683956151100",
                    "address": "1 Mound Place, Edinburgh, EH1 2LU"
                },
                {
                    "name": "Minto House",
                    "abbreviation": "minto-house",
                    "campuses": ["Central"],
                    "categories": ["Buildings"],
                    "longitude": "-3.1889104843139650",
                    "latitude": "55.9477940726016200",
                    "address": "20-22 Chambers Street, Edinburgh, EH1 1JZ"
                }
            ]}
        };
    }
    setUpJson();
    ajaxStub.yields(json);
    setupCampusMap.makeNewCampusMap();
    jsonAsString=localStorage.getItem("mapdata");
    ajaxStub.restore();
    var setup = function(){
        setStorageToHaveStorageAndMatchingDatesButNoMapData();
        setUpJson();
        setModelBackToDefaultValues();
    };
    var _categories,_locations,_campuses,_location, _matchingLocations;
    _categories=CampusMap.model.categories;
    _locations=CampusMap.model.locations;
    _campuses=CampusMap.model.campuses;
    _location=CampusMap.model.location;
    _matchingLocations= CampusMap.model.matchingLocations;

    var setModelBackToDefaultValues = function (){
        CampusMap.model.categories=_categories;
        CampusMap.model.locations=_locations;
        CampusMap.model.location=_location;
        CampusMap.model.campuses=_campuses;
        CampusMap.model.matchingLocations=_matchingLocations;
    };

    var setStorageToHaveStorageAndMatchingDatesButNoMapData = function(){
        localStorageStub.withArgs("mapdatarefreshdate").returns("aaa");
        localStorageStub.withArgs("mapdata").returns(null);
        CampusMap.hasStorage=true;
        CampusMap.options.mapOptions.mapdatarefreshdate="aaa";
        mapOptions.mapdatarefreshdate='aaa';
    };
    jqUnit.testStart(setup);

    /* times out after 500ms*/
    jqUnit.asyncTest("clicking on a marker pops up an info window containing the location name", function () {
    	jqUnit.expect(2);
        var name=CampusMap.model.locations[0].name.replace(/ /g,'');
        jqUnit.assertFalse("named popup not initially present",$("#"+name+"popup").length);
        CampusMap.model.locations[0].marker.triggerEvent('click');
        var start = new Date().getTime();
        var interval=setInterval(function(){
        	if($("#"+name+"popup").length){
	            jqUnit.assertTrue("after click named popup present", $("#"+name+"popup").length);
	            clearInterval(interval);
	        	jqUnit.start();
        	}
        	if (new Date().getTime()-start >500){
            	console.log("timeout as didnt find popup");
            	clearInterval(interval);
            	jqUnit.start();
            }
        },50);
    });
    	// this test only passes in chrome - the cause is the step where popup.click() is called.
//    jqUnit.asyncTest("clicking on a marker popup opens location details window", function () {
//    	jqUnit.expect(1);
//    	var name=CampusMap.model.locations[0].name.replace(/ /g,'');
//        CampusMap.model.locations[0].marker.triggerEvent('click');
//        var locationDetailsEventSpy=sinon.spy(CampusMap.events.onLocationSelect,"fire");
//        var start = new Date().getTime();
//        var interval= setInterval(function(){
//            var popup= $("#"+name+"popup").get(0);
//            console.log("waiting for popup");
//            if(popup) {
//            	clearInterval(interval);
//            	console.log("found popup");
//            	console.log(new Date().getTime()-start);
//            	popup.click();
//            	console.log(new Date().getTime()-start);
//            }
//            if (new Date().getTime()-start >550){
//            	console.log("didnt find popup");
//            	clearInterval(interval);
//            }
//        },100);
//        var interval2=setInterval(function(){
//        	 if(locationDetailsEventSpy.calledOnce) {
//        		 console.log("called spy");
//        		 clearInterval(interval2);
//	        	 jqUnit.assertTrue("clicking popup triggers location detail event",locationDetailsEventSpy.calledOnce);
//	             jqUnit.start();
//        	 }
//        	 if (new Date().getTime()-start >1000){
//        		 clearInterval(interval2);
//        		 jqUnit.start();
//        		 console.log("timeout on spy");
//             }
//        	 console.log("waiting for spy");
//        },100);
//    });

    /* (See below)  tests which create a new map have to come before the others else we get tests that call asynchronous events on a map object which doesn't exist any more*/
    jqUnit.test("Ajax call  made for data when localstorage has no map data and refresh dates match", function () {
    	console.log("next test!");
    	CampusMap.hasStorage=true;
        var _ajaxStub=sinon.stub($,"get");
        _ajaxStub.yields(json);
        setupCampusMap.makeNewCampusMap();
        jqUnit.assertTrue("ajaxstub called when no data in localstorage",_ajaxStub.called);
        _ajaxStub.restore();
    });
    /*Note this test cannot come as the last in the series of tests that create a new map as only the Ajax calling code builds the full data model
    * with categories, campuses etc*/
    jqUnit.test("Ajax call  NOT made for data when localstorage has map data and refresh dates do  match", function () {
        localStorageStub.restore();//there is real mapdata in the store at this point
        var _ajaxStub=sinon.stub($,"get");
        _ajaxStub.yields(json);
        setupCampusMap.makeNewCampusMap();
        jqUnit.assertFalse("ajaxstub not called when matching dates and data in localstorage",_ajaxStub.called);
        _ajaxStub.restore();
        localStorageStub=sinon.stub(localStorage,"getItem");
    });

    jqUnit.test("MapView refreshView is called during setup of map", function () {
        var refreshViewSpy=sinon.spy(CampusMap.MapView,"refreshView");
        var _ajaxStub=sinon.stub($,"get");
        _ajaxStub.yields(json);
        setupCampusMap.reusePreviousCampusMap();
        jqUnit.assertTrue("refreshView called during setup",refreshViewSpy.called);
        _ajaxStub.restore();
        refreshViewSpy.restore();
    });

    jqUnit.test("Ajax call  made for data when localstorage has map data but refresh dates do not match", function () {
        localStorageStub.withArgs("mapdata").returns(jsonAsString);//JSON.stringify(CampusMaps.model) gives a circular reference error for some reason?
        mapOptions.mapdatarefreshdate='aab';
        var _ajaxStub=sinon.stub($,"get");
        _ajaxStub.yields(json);
        setupCampusMap.makeNewCampusMap();
        jqUnit.assertTrue("ajaxstub called when no data in localstorage",_ajaxStub.called);
        _ajaxStub.restore();
    });

    /* (See above) tests which create a new map have to come before the others else we get tests that call asynchronous events on a map object which doesn't exist any more*/

    jqUnit.test("MapView refreshView calls closeInfoWindow", function () {
        var closeInfoWindowStub=sinon.stub(CampusMap.MapView,"closeInfoWindow");
        CampusMap.MapView.refreshView();
        jqUnit.assertTrue("MapView refreshView calls closeInfoWindow",closeInfoWindowStub.called);
        closeInfoWindowStub.restore();
    });

    jqUnit.test("MapView refreshView clears markers when model clearmarkers", function () {
        var clearStub=sinon.stub(CampusMap.MapView.map,"clear");
        CampusMap.model.clearMarkers=true;
        CampusMap.MapView.refreshView();
        jqUnit.assertTrue("MapView refreshView clears markers when model clearmarkers",clearStub.called);
        clearStub.restore();
    });

    jqUnit.test("MapView refreshView does not clear markers when ! model clearmarkers", function () {
        var clearStub=sinon.stub(CampusMap.MapView.map,"clear");
        CampusMap.model.clearMarkers=false;
        CampusMap.MapView.refreshView();
        jqUnit.assertFalse("MapView refreshView does not clear markers when !model clearmarkers",clearStub.called);
        clearStub.restore();
    });

    jqUnit.test("MapView refreshView adds a marker for each location to display", function () {
        CampusMap.model.clearMarkers=false;
        $(CampusMap.model.matchingLocations).each(function(){
            this.marker=null;
        });
        var addMarkerSpy=sinon.spy(CampusMap.MapView.map,"addMarker");
        CampusMap.MapView.refreshView();
        $(CampusMap.model.matchingLocations).each(function(){
            jqUnit.assertTrue("marker should be added for each location",this.marker!==null);
        });
        jqUnit.assertTrue("map addMarker called twice", addMarkerSpy.calledTwice);
    });

    jqUnit.test("MapView refreshView has only 1 location to display when model.location !=null", function () {
        CampusMap.model.clearMarkers=false;
        $(CampusMap.model.locations).each(function(){
            this.marker=null;
        });
        CampusMap.model.matchingLocations=CampusMap.model.locations[1];
        CampusMap.model.location=CampusMap.model.locations[0];
        CampusMap.MapView.refreshView();
        jqUnit.assertTrue("marker should be added for location",CampusMap.model.location.marker!==null);
        jqUnit.assertTrue("marker should not be added for any but chosen location",CampusMap.model.locations[1].marker===null);

    });

    jqUnit.test("MapView refreshView, when recenter true and campus chosen, sets centre of map to be average location of all in chosen campus", function () {
        CampusMap.model.clearMarkers=false;
        CampusMap.model.locations[0].latitude=6;
        CampusMap.model.locations[0].longitude=6;
        CampusMap.model.locations[1].latitude=2;
        CampusMap.model.locations[1].longitude=2;
        CampusMap.model.recenter=true;
        CampusMap.model.campus=CampusMap.model.getCategoryByName('Central');
        CampusMap.model.location=null;
        CampusMap.MapView.refreshView();
        jqUnit.assertEquals("should be centred at average of campus marker lat/langs",4,CampusMap.MapView.currentLocation.lat());
        jqUnit.assertEquals("should be centred at average of campus marker lat/langs",4,CampusMap.MapView.currentLocation.lng());
    });

    jqUnit.test("MapView refreshView, when model.location!=null, sets centre of map to be model.location", function () {
        CampusMap.model.clearMarkers=false;
        CampusMap.model.locations[0].latitude=6;
        CampusMap.model.locations[0].longitude=6;
        CampusMap.model.locations[1].latitude=2;
        CampusMap.model.locations[1].longitude=2;
        CampusMap.model.recenter=true;
        CampusMap.model.campus=CampusMap.model.getCategoryByName('Central');
        CampusMap.model.location=CampusMap.model.locations[0];
        CampusMap.MapView.refreshView();
        jqUnit.assertEquals("should be centred at model location",6,CampusMap.MapView.currentLocation.lat());
        jqUnit.assertEquals("should be centred at model location",6,CampusMap.MapView.currentLocation.lng());
    });

	 jqUnit.test("fluid IOC creates the map component creator functions", function () {
		 jqUnit.expect(5);
		 jqUnit.assertNotNull("map.CampusMap should not be null",map.CampusMap);
		 jqUnit.assertNotNull("map.CategoriesView should not be null",map.CategoriesView);
		 jqUnit.assertNotNull("map.CategoryLocationsView should not be null",map.CategoryLocationsView);
		 jqUnit.assertNotNull("map.LocationDetailView should not be null",map.LocationDetailView);
		 jqUnit.assertNotNull("map.MapView should not be null",map.MapView);
		 
	 });
	 
	 jqUnit.test("the component creator functions create a component object hierarchy", function () {
		 jqUnit.expect(5);
		 jqUnit.assertNotNull("CampusMap should not be null",CampusMap);
		 jqUnit.assertNotNull("CategoriesView should not be null",CampusMap.CategoriesView);
		 jqUnit.assertNotNull("CampusMap.CategoryLocationsView should not be null",CampusMap.CategoryLocationsView);
		 jqUnit.assertNotNull("CampusMap.LocationDetailView should not be null",CampusMap.LocationDetailView);
		 jqUnit.assertNotNull("CampusMap.MapView should not be null",CampusMap.MapView);
		 
	 });
	 
	 jqUnit.test("mapview formats address with three commas present", function () {
		 var formattedText=CampusMap.MapView.formatInfoAddress("addresspart1,addresspart2,addresspart3,addresspart4");
		 jqUnit.assertEquals("formatted text should be main-address newline then city plus postcode",
				 "<br>addresspart1,addresspart2<br>addresspart3,addresspart4", formattedText);
	 });
	 
	 jqUnit.test("mapview formats address with two commas present", function () {
		 var formattedText=CampusMap.MapView.formatInfoAddress("addresspart1,addresspart2,addresspart3");
		 jqUnit.assertEquals("formatted text should be main-address newline then city plus postcode",
				 "<br>addresspart1<br>addresspart2,addresspart3", formattedText);
	 });
	 
	 jqUnit.test("mapview formats address with one comma present", function () {
		 var formattedText=CampusMap.MapView.formatInfoAddress("addresspart1,addresspart2");
		 jqUnit.assertEquals("formatted text should be main-address newline then city plus postcode",
				 "<br>addresspart1<br>addresspart2", formattedText);
	 });
	 
	 jqUnit.test("mapview formats address with no comma present", function () {
		 var formattedText=CampusMap.MapView.formatInfoAddress("addresspart1");
		 jqUnit.assertEquals("formatted text should be main-address newline then city plus postcode",
				 "<br>addresspart1", formattedText);
	 });
	 
	 jqUnit.test("mapview formats empty address", function () {
		 var formattedText=CampusMap.MapView.formatInfoAddress();
		 jqUnit.assertEquals("formatted text should be main-address newline then city plus postcode",
				 "", formattedText);
	 });
	 
	 jqUnit.test("mapview formats empty string address", function () {
		 var formattedText=CampusMap.MapView.formatInfoAddress("");
		 jqUnit.assertEquals("formatted text should be main-address newline then city plus postcode",
				 "", formattedText);
	 });
	 
	 jqUnit.test("mapview formats null string address", function () {
		 var formattedText=CampusMap.MapView.formatInfoAddress(null);
		 jqUnit.assertEquals("formatted text should be main-address newline then city plus postcode",
				 "", formattedText);
	 });
	 
	 jqUnit.test("test MapView get Distance returns a number", function () {
		 jqUnit.expect(1);
		 var point1 = {latitude:56, longitude:100};
		 var point2 = {latitude:54, longitude:99};
		 var distance = CampusMap.MapView.getDistance(point1, point2);
		 jqUnit.assertDeepEq(typeof distance==="number");
	 });
	 
	 jqUnit.test("test model is not null", function () {
		 jqUnit.expect(1);
		 jqUnit.assertNotNull("CampusMaps.model should not be null",CampusMap.model);
	 });
	 
	 jqUnit.test("test model category size", function () {
		 var categories = CampusMap.model.categories;
		 jqUnit.assertEquals("categories should contain building and central and ALL",3,categories.length);
	 });
	 
	 jqUnit.test("test model locations size", function () {
		 var locations = CampusMap.model.locations;
		 jqUnit.assertEquals("locations should contain 2",2,locations.length);
	 });
	 
	 jqUnit.test("test model matching locations size", function () {
		 var matchingLocations = CampusMap.model.matchingLocations;
		 jqUnit.assertEquals("locations should contain 2",2,matchingLocations.length);
	 });
	 
	 jqUnit.test("test model campuses size", function () {
		 var campuses = CampusMap.model.campuses;
		 jqUnit.assertEquals("campuses should contain 1",1,campuses.length);
	 });

	 function setUpPageElements(config){
         CampusMap.locate("searchContainer").hide();
         CampusMap.locate("mapContainer").hide();
         $(".portlet-wrapper-titlebar").hide();
         $("#titleShowSearch").hide();
         $("#locate_me_holder").hide();
         $(".map #map-info").hide();
         CampusMap.locate("categoriesContainer").hide();
         CampusMap.locate("locationDetailContainer").hide();
         if(config.map){
             CampusMap.locate("mapContainer").show();
         }
         if(config.titlebar){
             $(".portlet-wrapper-titlebar").show();
         }
         if(config.searchForm){
             CampusMap.locate("searchContainer").show();
         }
         if(config.searchButton){
             $("#titleShowSearch").show();
         }
         if(config.locateButton){
             $("#locate_me_holder").show();
         }
         if(config.categories){
             CampusMap.locate("categoriesContainer").show();
         }
         if(config.locationDetail){
             CampusMap.locate("locationDetailContainer").show();
         }
         if(config.mapInfo){
             $(".map #map-info").show();
         }
     }
	 //note this is also testing that the selectors (eg ".map-search-container" have been correctly mapped to fluid container names
	 jqUnit.test("onShowSearchView shows and hides correct components", function () {
         setUpPageElements({searchButton:true,categories:true,locations:true});
		 CampusMap.events.onShowSearchView.fire();
         jqUnit.isVisible(" searchView should be visible", CampusMap.locate("searchContainer"));
         jqUnit.isVisible(" map container should be visible", CampusMap.locate("mapContainer"));
         jqUnit.isVisible(" title bar should be visible",$(".portlet-wrapper-titlebar") );
         jqUnit.notVisible(" search button should not be visible", $("#titleShowSearch"));
         jqUnit.notVisible(" categoriesContainer should not be visible", CampusMap.locate("categoriesContainer"));
		 jqUnit.notVisible(" locationDetailContainer should not be visible", CampusMap.locate("locationDetailContainer"));
	 });
	 
	 jqUnit.test("onShowSearchView has no effect on recenter and clear markers", function () {
		 assertSetMarkersAfterEvent(true,true, function(){CampusMap.events.onShowSearchView.fire()},true,true);
		 assertSetMarkersAfterEvent(false,false, function(){CampusMap.events.onShowSearchView.fire()},false,false);
	 });
	 
	 function setupAndFireLocationMapView(){
		 CampusMap.model.location=CampusMap.model.locations[0];
		 CampusMap.events.onLocationMapView.fire();
	 }
	 jqUnit.test("onLocationMapView shows and hides correct components", function () {
         setUpPageElements({categories:true,locations:true});
		 setupAndFireLocationMapView();
		 jqUnit.isVisible(" searchView should be visible", CampusMap.locate("searchContainer"));
		 jqUnit.isVisible(" map container should be visible", CampusMap.locate("mapContainer"));
         jqUnit.isVisible(" locate me button should be visible", $('#locate_me_holder'));
         jqUnit.isVisible(" title bar should be visible",$(".portlet-wrapper-titlebar") );
		 jqUnit.notVisible(" categoriesContainer should not be visible", CampusMap.locate("categoriesContainer"));
		 jqUnit.notVisible(" locationDetailContainer should not be visible", CampusMap.locate("locationDetailContainer"));
	 });

	 jqUnit.test("onLocationMapView sets false for recenter and clear markers", function () {
		 assertSetMarkersAfterEvent(true,true, function(){setupAndFireLocationMapView()},false,false);
	 });

    function assertGlobalTitleBarTextAfterEvent(callback, titlebartext) {
        var titlebarOriginalText = titlebartext+'aaaa';
        $('#global_title').text(titlebartext+'aaaa');
        var test=$('#global_title').text();
        callback();
        test=$('#global_title').text();
        jqUnit.assertEquals("title bar text should be set: ",titlebartext,$('#global_title').text());
    }

    jqUnit.test("onLocationMapView sets global titlebar text to empty string", function () {
        assertGlobalTitleBarTextAfterEvent(function(){ setupAndFireLocationMapView()},"");
    });
	 
	 function setupAndFireLocation(){
		 CampusMap.model.location=CampusMap.model.locations[0];
		 CampusMap.events.onLocationSelect.fire(CampusMap.model.location);
	 }
	 
	 jqUnit.test("onLocationSelect shows and hides correct components", function () {
         setUpPageElements({map:true,searchForm:true,searchButton: true, locateButton:true,categories:true, mapInfo:true});
		 setupAndFireLocation();
		 jqUnit.notVisible(" searchForm should not be visible", CampusMap.locate("searchContainer"));
		 jqUnit.notVisible(" categoriesContainer should not be visible", CampusMap.locate("categoriesContainer"));
		 jqUnit.notVisible(" map container should not be visible", CampusMap.locate("mapContainer"));
         jqUnit.notVisible(" search button should not be visible", $("#titleShowSearch"));
         jqUnit.notVisible(" locate me button should not be visible", $('#locate_me_holder'));
         jqUnit.notVisible(" map info should not be visible",$(".map #map-info") );
		 jqUnit.isVisible(" locationDetailContainer should  be visible", CampusMap.locate("locationDetailContainer"));
         jqUnit.isVisible(" title bar should be visible",$(".portlet-wrapper-titlebar") );
	 });
	 
	 jqUnit.test("onLocationSelect has no effect on recenter and clear markers", function () {
		 assertSetMarkersAfterEvent(true,true, function(){setupAndFireLocation},true,true);
		 assertSetMarkersAfterEvent(false,false, function(){setupAndFireLocation},false,false);
	 });
	 
	 jqUnit.test("onShowCategoriesView shows and hides correct components", function () {
         setUpPageElements({map:true,searchForm:true,searchButton: true, locateButton:true, locationDetail:true, mapInfo:true});
		 CampusMap.events.onShowCategoriesView.fire();
		 jqUnit.notVisible(" searchForm should not be visible", CampusMap.locate("searchContainer"));
		 jqUnit.notVisible(" map container should not be visible", CampusMap.locate("mapContainer"));
         jqUnit.notVisible(" locationDetailContainer should  not be visible", CampusMap.locate("locationDetailContainer"));
         jqUnit.notVisible(" search button should not be visible", $("#titleShowSearch"));
         jqUnit.notVisible(" locate me button should not be visible", $('#locate_me_holder'));
         jqUnit.notVisible(" map info should not be visible",$(".map #map-info") );
         jqUnit.isVisible(" title bar should be visible",$(".portlet-wrapper-titlebar") );
         jqUnit.isVisible(" categoriesContainer should be visible", CampusMap.locate("categoriesContainer"));
     });
	 
	 jqUnit.test("onShowCategoriesView sets false for recenter and true for clear markers", function () {
        assertSetMarkersAfterEvent(true,false,function(){CampusMap.events.onShowCategoriesView.fire()},false,true);
    });

    jqUnit.test("onShowCategoriesView calculates visibility of markers", function () {
        var target = sinon.spy(CampusMap.MapView,"calculateVisibleAndPossibleLocationsByCategory");
        CampusMap.events.onShowCategoriesView.fire();
        jqUnit.assertTrue("calculateVisibleAndPossibleLocationsByCategory should be called on category view",target.called);
        target.restore();
    });

    jqUnit.test("onShowCategoriesView adds 'offmap' to the text() of category elements that  have no visible markers", function () {
        CampusMap.model.getCategoryByName('Buildings').numVisible=0;

        CampusMap.events.onShowCategoriesView.fire();
        $('.map-category-link:visible').each(function(idx,element) {
            if(element.text.indexOf('Buildings')!=-1) {
                jqUnit.assertTrue("offmap should be added to the category ", element.text.indexOf('off') !== -1);
            }
        });
    });

    jqUnit.test("calculateVisibleAndPossibleLocationsByCategory calculates numMatching and numVisible for each category", function () {
        var target = sinon.stub(CampusMap.MapView.map,"get");
        var mapStub = {getBounds: function() {return {};}};
        target.withArgs('map').returns(mapStub);
        $(CampusMap.model.categories).each(function(){
            this.numMatching=0;
            this.numVisible=0;
        });
        var locationVisibleStub=sinon.stub(CampusMap.MapView,"locationIsVisible");

        locationVisibleStub.withArgs({},CampusMap.model.categories[0].locations[0]).returns(true);
        locationVisibleStub.withArgs({},CampusMap.model.categories[0].locations[1]).returns(false);
        CampusMap.events.onShowCategoriesView.fire();
        $(CampusMap.model.categories).each(function(){
            if(this.name!=='ALL') {
                jqUnit.assertEquals("should be 2 locations for this category", 2, this.numMatching);
                jqUnit.assertEquals("should be 1 visible location for this category", 1, this.numVisible);
            }
            else {
                jqUnit.assertEquals("should be 2 locations for ALL category", 2, this.numMatching);
                jqUnit.assertEquals("should be 1 visible location for ALL category", 1, this.numVisible);
            }
        });
        target.restore();
        locationVisibleStub.restore();
    });

    jqUnit.test("onCategorySelect calls refreshView, sets location null, sets title to category", function () {
        var target = sinon.spy(CampusMap.MapView,"refreshView");
        CampusMap.model.location = {};
        var prev=CampusMap.model.category.name;
        CampusMap.model.category.name = "blah";
        CampusMap.events.onCategorySelect.fire();
        jqUnit.assertTrue("refreshView should be called on category map  view",target.called);
        jqUnit.assertTrue("location should be null",CampusMap.model.location===null);
        jqUnit.assertEquals("title should be set to category name","blah",$(".map #map-info .title").text());
        CampusMap.model.category.name=prev;
        target.restore();
    });

    jqUnit.test("onLocationMapView calls refreshView, sets matchingLocations to model.location", function () {
        var target = sinon.spy(CampusMap.MapView,"refreshView");
        CampusMap.model.location = {name:'blah'};
        CampusMap.model.matchingLocations= [];
        CampusMap.events.onLocationMapView.fire();
        jqUnit.assertTrue("refreshView should be called on location map view",target.called);
        jqUnit.assertEquals("matching locations should be set to location",CampusMap.model.location, CampusMap.model.matchingLocations[0]);
        target.restore();
    });

    jqUnit.test("onUpdateSearchResults calls refreshView, sets recenter and clearmarkers to true", function () {
        var target = sinon.spy(CampusMap.MapView,"refreshView");
        CampusMap.model.recenter=false;
        CampusMap.model.clearMarkers=false;
        CampusMap.events.onUpdateSearchResults.fire();
        jqUnit.assertTrue("refreshView should be called on results map view",target.called);
        jqUnit.assertTrue("clear markers should be true",CampusMap.model.clearMarkers);
        jqUnit.assertTrue("recenter should be true",CampusMap.model.recenter);
        target.restore();
    });

	 jqUnit.test("onShowCampusesView shows and hides correct components", function () {
         setUpPageElements({map:true,searchForm:true,searchButton: true, locateButton:true, locationDetail:true, mapInfo:true});
         CampusMap.events.onShowCampusesView.fire();
         jqUnit.notVisible(" searchForm should not be visible", CampusMap.locate("searchContainer"));
         jqUnit.notVisible(" map container should not be visible", CampusMap.locate("mapContainer"));
         jqUnit.notVisible(" locationDetailContainer should  not be visible", CampusMap.locate("locationDetailContainer"));
         jqUnit.notVisible(" search button should not be visible", $("#titleShowSearch"));
         jqUnit.notVisible(" locate me button should not be visible", $('#locate_me_holder'));
         jqUnit.notVisible(" map info should not be visible",$(".map #map-info") );
         jqUnit.isVisible(" title bar should be visible",$(".portlet-wrapper-titlebar") );
         jqUnit.isVisible(" categoriesContainer should be visible", CampusMap.locate("categoriesContainer"));
	 });
	 
	 jqUnit.test("onShowCampusesView sets true for recenter and true for clear markers", function () {
		 assertSetMarkersAfterEvent(false,false, function(){CampusMap.events.onShowCampusesView.fire()},true,true);
	 });

	 function setupAndFireCategorySelect(){
		 CampusMap.model.category = CampusMap.model.categories[0];
		 CampusMap.events.onCategorySelect.fire(CampusMap.model.category);
	 }

	 jqUnit.test("onCategorySelect shows and hides correct components", function () {
         setUpPageElements({locationDetails:true,categories:true})
		 setupAndFireCategorySelect();
		 jqUnit.isVisible(" searchView should  be visible", CampusMap.locate("searchContainer"));
		 jqUnit.isVisible(" map container should be visible", CampusMap.locate("mapContainer"));
         jqUnit.isVisible(" locate me button should be visible", $('#locate_me_holder'));
         jqUnit.notVisible(" search button should not be visible", $("#titleShowSearch"));
         jqUnit.isVisible(" title bar should be visible",$(".portlet-wrapper-titlebar") );
         jqUnit.isVisible(" map info should be visible",$(".map #map-info") );
         jqUnit.notVisible(" categoriesContainer should not be visible", CampusMap.locate("categoriesContainer"));
         jqUnit.notVisible(" locationDetailContainer should  not be visible", CampusMap.locate("locationDetailContainer"));
	 });

    jqUnit.test("clicking a category sets matching locations to that categories locations and sets model category", function () {
        setUpPageElements({map:true,searchForm:true,searchButton: true, locateButton:true, locationDetail:true, mapInfo:true});
        CampusMap.events.onShowCategoriesView.fire();
        CampusMap.model.matchingLocations=[];
        CampusMap.model.category=null;
        var buildingsCategoryLink=$(".map-category-link:contains('Buildings')").get(0);
        var category = CampusMap.model.getCategoryByName("Buildings");
        var fakeLocation = {name:"testLocation"};
        category.locations.push(fakeLocation);
        $(buildingsCategoryLink).trigger('click');
        jqUnit.assertTrue("three locations in Buildings and in Model's matching locations",CampusMap.model.matchingLocations.length===3);
        jqUnit.assertTrue("model category selected",CampusMap.model.category===category);
        category.locations.splice(category.locations.indexOf(fakeLocation),1);
    });

    jqUnit.test("clicking the 'ALL' category sets matching locations to the 'ALL' categories locations and sets model category", function () {
        setUpPageElements({map:true,searchForm:true,searchButton: true, locateButton:true, locationDetail:true, mapInfo:true});
        CampusMap.events.onShowCategoriesView.fire();
        CampusMap.model.matchingLocations=[];
        CampusMap.model.category=null;
        var category = CampusMap.model.getCategoryByName("ALL");
        var fakeLocation = {name:"testLocation"};
        category.locations.push(fakeLocation);
        var allCategoryLink=$(".map-category-link:contains('ALL')").get(0);
        $(allCategoryLink).trigger('click');
        jqUnit.assertTrue("two locations in ALL and in Model's matching locations",CampusMap.model.matchingLocations.length===3);
        jqUnit.assertTrue("model category selected",CampusMap.model.category===category);
        category.locations.splice(category.locations.indexOf(fakeLocation),1);
    });

    jqUnit.test("clicking a campus sets matching locations to the 'ALL' categories locations and sets model campus", function () {
        setUpPageElements({map:true,searchForm:true,searchButton: true, locateButton:true, locationDetail:true, mapInfo:true});
        CampusMap.events.onShowCampusesView.fire();
        CampusMap.model.matchingLocations=[];
        CampusMap.model.campus=null;
        var campusCategoryLink=$(".map-category-link:contains('Central')").get(0);
        var category = CampusMap.model.getCategoryByName("ALL");
        var fakeLocation = {name:"testLocation"};
        category.locations.push(fakeLocation);
        $(campusCategoryLink).trigger('click');
        jqUnit.assertTrue("three locations in Buildings and in Model's matching locations",CampusMap.model.matchingLocations.length===3);
        jqUnit.assertTrue("model campus selected",CampusMap.model.campus===CampusMap.model.getCategoryByName('Central'));
        category.locations.splice(category.locations.indexOf(fakeLocation),1);
    });

	 
	 jqUnit.test("onCategorySelect has no effect on  recenter or clear markers", function () {
		 assertSetMarkersAfterEvent(false,false,function(){setupAndFireCategorySelect()},false,false);
		 assertSetMarkersAfterEvent(true,true,function(){setupAndFireCategorySelect()},true,true);
	 });

	 function assertSetMarkersAfterEvent(recenter,clear,callback,postEventRecenter, postEventClear){
		 CampusMap.model.recenter=recenter;
		 CampusMap.model.clearMarkers=clear;
		 callback();
		 if(postEventRecenter) {
			 jqUnit.assertTrue("recenter ",CampusMap.model.recenter);
		 }
		 else {
			 jqUnit.assertFalse("recenter ",CampusMap.model.recenter);
		 }
		 if(postEventClear) {
			 jqUnit.assertTrue("clearing markers ",CampusMap.model.clearMarkers);
		 }
		 else {
			 jqUnit.assertFalse("clearing markers ",CampusMap.model.clearMarkers);
		 }
	 }

    jqUnit.test("model refresh dates should match returns false when there is no local storage", function () {
        CampusMap.hasStorage=false;
        jqUnit.assertFalse("model refresh dates should not match",CampusMap.modelRefreshDatesMatch());
    });
    /*a sinon stub in setup() will make them match*/
    jqUnit.test("model refresh dates should match returns true when there is local storage and stored date matches mapoption", function () {
        CampusMap.hasStorage=true;
        jqUnit.assertTrue("model refresh dates should match",CampusMap.modelRefreshDatesMatch());
    });

    jqUnit.test("model refresh dates should match returns false when no stored date even when there is local storage", function () {
        CampusMap.hasStorage=true;
        localStorageStub.withArgs("mapdatarefreshdate").returns(null);
        jqUnit.assertFalse("model refresh dates should not match",CampusMap.modelRefreshDatesMatch());
    });

    jqUnit.test("model refresh dates should match returns false when stored date does not match mapoption even when there is local storage", function () {
        CampusMap.hasStorage=true;
        CampusMap.options.mapOptions.mapdatarefreshdate="aab";
        jqUnit.assertFalse("model refresh dates should not match",CampusMap.modelRefreshDatesMatch());
    });

    jqUnit.test("has stored model data false when no local storage", function () {
        CampusMap.hasStorage=false;
        jqUnit.assertFalse("has stored model data should not match",CampusMap.hasStoredModelData());
    });

    jqUnit.test("has stored model data false when there is local storage but no mapdata in it", function () {
        CampusMap.hasStorage=true;
        var test = localStorage.getItem("mapdata");
        if(localStorage.getItem("mapdata")){
            //ensure that our test browser doesnt contain local storage and our stub is in place
            jqUnit.fail("should be no data in local storage");
        }
        jqUnit.assertFalse("has stored model data should not match",CampusMap.hasStoredModelData());
    });

    jqUnit.test("has stored model data true when there is local storage and mapdata in it", function () {
        CampusMap.hasStorage=true;
        localStorageStub.withArgs("mapdata").returns('a');
        jqUnit.assertTrue("has stored model data should match",CampusMap.hasStoredModelData());
    });

    /*stubs a happy path call to Google's geolocation service - a real call gets blocked*/
    setupGeoLocationStubs = {
        getCurrentPositionStub: '',
        unblockUIStub: '',
        blockUIStub: '',
        mapOptionStub: '',
        mapAddShapeStub : '',
        StyledMarkerSpy: '',
        stub: function () {
            this.unblockUIStub = sinon.stub($, "unblockUI");
            this.blockUIStub = sinon.stub($, "blockUI");
            this.getCurrentPositionStub = sinon.stub(CampusMap.MapView.map, "getCurrentPosition");
            this.mapOptionStub = sinon.stub(CampusMap.MapView.map, "option");
            this.mapAddShapeStub= sinon.stub(CampusMap.MapView.map, "addShape");
            this.getCurrentPositionStub.yields({coords: {latitude: 1, longitude: 1}}, "OK");
            this.StyledMarkerSpy = sinon.spy(window,"StyledMarker");
        },
        unstub: function () {
            this.getCurrentPositionStub.restore();
            this.unblockUIStub.restore();
            this.blockUIStub.restore();
            this.mapOptionStub.restore();
            this.mapAddShapeStub.restore();
            this.StyledMarkerSpy.restore();
        }
    };

    jqUnit.test("click locate me button calls blockUI", function () {
        setupGeoLocationStubs.stub();
        $("#Locate_me").trigger('click');
        jqUnit.assertTrue("geolocation click calls blockUI",setupGeoLocationStubs.blockUIStub.called);
        setupGeoLocationStubs.unstub();
    });

    jqUnit.test("click locate me button calls unBlockUI", function () {
        setupGeoLocationStubs.stub();
        $("#Locate_me").trigger('click');
        jqUnit.assertTrue("geolocation click calls unblockUI",setupGeoLocationStubs.unblockUIStub.called);
        setupGeoLocationStubs.unstub();
    });

    jqUnit.test("after geolocation title should be set to Your Location", function () {
        setupGeoLocationStubs.stub();
        $("#Locate_me").trigger('click');
        jqUnit.assertEquals("after geolocation title should be set to Your Location","Your location",$(".map #map-info .title").text());
        setupGeoLocationStubs.unstub();
    });

    jqUnit.test("after geolocation map is centered at coords returned by Google", function () {
        setupGeoLocationStubs.stub();
        var clientPosition = new google.maps.LatLng(1, 1);
        var mapOptionStub = setupGeoLocationStubs.mapOptionStub.withArgs('center',clientPosition);
        $("#Locate_me").trigger('click');
        jqUnit.assertTrue("after geolocation map is centered at coords returned by Google",mapOptionStub.called);
        setupGeoLocationStubs.unstub();
    });

    jqUnit.test("after geolocation a circle is added to the map at the coords returned by Google", function () {
        setupGeoLocationStubs.stub();
        var clientPosition = new google.maps.LatLng(1, 1);
        var mapAddShapeStub = setupGeoLocationStubs.mapAddShapeStub;
        $("#Locate_me").trigger('click');
        jqUnit.assertTrue("after geolocation a circle is added to the map",mapAddShapeStub.called);
        var test = mapAddShapeStub.args[0][1].center;
        jqUnit.assertDeepEq("circle is centered on google coords",clientPosition,test);
        setupGeoLocationStubs.unstub();
    });

    jqUnit.test("after geolocation a StyledMarker is added to the map at the coords returned by Google", function () {
        setupGeoLocationStubs.stub();
        var clientPosition = new google.maps.LatLng(1, 1);
        $("#Locate_me").trigger('click');
        jqUnit.assertTrue("after geolocation a StyledMarker is added to the map",setupGeoLocationStubs.StyledMarkerSpy.called);
        var test = setupGeoLocationStubs.StyledMarkerSpy.args[0][0].position;
        jqUnit.assertDeepEq("StyledMarker is centered on google coords",clientPosition,test);
        setupGeoLocationStubs.unstub();
    });

});
})(jQuery);