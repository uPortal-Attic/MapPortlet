/**
 * Licensed to Jasig under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Jasig licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.jasig.portlet.maps.mvc.portlet;

import java.util.*;

import javax.portlet.PortletPreferences;
import javax.portlet.RenderRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.portlet.ModelAndView;

@Controller
@RequestMapping("VIEW")
public class MapViewController {

    public static final String PREFERENCE_STARTING_LOCATION ="startinglocation";
    public static final String PREFERENCE_STARTING_LATITUDE ="startinglocation";
    public static final String PREFERENCE_STARTING_LONGITUDE ="startinglocation";
    public static final String PREFERENCE_STARTING_ZOOM = "startingZoom";
    public static final String PREFERENCE_UNIT_OF_MEASURE ="startingScale";
    public static final String MAP_OPTION_MAPTYPE_CONTROL = "mapTypeControlBool";
    public static final String MAP_OPTIONS_PAN_CONTROL = "panControlBool";
    public static final String MAP_OPTIONS_ZOOM_CONTROL = "zoomControlBool";
    public static final String MAP_OPTIONS_STREET_VIEW = "streetViewBool";
    public static final String MAP_OPTIONS_SCALE_CONTROL = "scaleControlBool";
    public static final String MAP_OPTIONS_ROTATE_CONTROL = "rotateControlBool";
    public static final String MAP_OPTIONS_OVERVIEW_CONTROL = "overviewControlBool";

    @RequestMapping
	public ModelAndView getView(RenderRequest request) throws Exception {
		Map<String,Object> map = new HashMap<String,Object>();
		
		PortletPreferences preferences = request.getPreferences();
		
		
		// Optional starting location & zoom level
		String startingLocation = preferences.getValue(PREFERENCE_STARTING_LOCATION, null);
        map.put(PREFERENCE_STARTING_LOCATION, startingLocation);
        
     // Optional starting location & zoom level
        String startingLatitude = preferences.getValue(PREFERENCE_STARTING_LATITUDE, "41.300937");
        map.put(PREFERENCE_STARTING_LATITUDE, startingLatitude);
        
     // Optional starting location & zoom level
        String startingLongitude = preferences.getValue(PREFERENCE_STARTING_LONGITUDE, "-72.932103");
        map.put(PREFERENCE_STARTING_LONGITUDE, startingLongitude);

        String startingZoom = preferences.getValue(PREFERENCE_STARTING_ZOOM, "1");
        map.put(PREFERENCE_STARTING_ZOOM, startingZoom);

     // 3959 = in miles, 6371 = kilometers. This is measurement of the earth's radius that sets the standard for distance in the forumla
        String startingScale = preferences.getValue(PREFERENCE_UNIT_OF_MEASURE, "3959");
        map.put(PREFERENCE_UNIT_OF_MEASURE, startingScale);

        
        String mapTypeControlBool = preferences.getValue(MAP_OPTION_MAPTYPE_CONTROL, "true");
        map.put(MAP_OPTION_MAPTYPE_CONTROL, mapTypeControlBool);
        
        String panControlBool = preferences.getValue(MAP_OPTIONS_PAN_CONTROL, "true");
        map.put(MAP_OPTIONS_PAN_CONTROL, panControlBool);
        
        String zoomControlBool = preferences.getValue(MAP_OPTIONS_ZOOM_CONTROL, "true");
        map.put(MAP_OPTIONS_ZOOM_CONTROL, zoomControlBool);
        
        String streetViewBool = preferences.getValue(MAP_OPTIONS_STREET_VIEW, "true");
        map.put(MAP_OPTIONS_STREET_VIEW, streetViewBool);
        
        String scaleControlBool = preferences.getValue(MAP_OPTIONS_SCALE_CONTROL, "true");
        map.put(MAP_OPTIONS_SCALE_CONTROL, scaleControlBool);
        
        String rotateControlBool = preferences.getValue(MAP_OPTIONS_ROTATE_CONTROL, "false");
        map.put(MAP_OPTIONS_ROTATE_CONTROL, rotateControlBool);
        
        String overviewControlBool = preferences.getValue(MAP_OPTIONS_OVERVIEW_CONTROL, "false");
        map.put(MAP_OPTIONS_OVERVIEW_CONTROL, overviewControlBool);
		
		return new ModelAndView("mapView", map);
	}
/*
    @RequestMapping
    public String getMapView() {
        return "mapView";
    }*/
    
}
