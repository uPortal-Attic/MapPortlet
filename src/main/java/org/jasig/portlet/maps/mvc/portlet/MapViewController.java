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

    public static final String PREFERENCE_STARTING_LATITUDE ="latitude";
    public static final String PREFERENCE_STARTING_LONGITUDE ="longitude";
    public static final String PREFERENCE_STARTING_ZOOM = "zoom";
    public static final String MAP_OPTION_MAPTYPE_CONTROL = "mapTypeControl";
    public static final String MAP_OPTIONS_PAN_CONTROL = "panControl";
    public static final String MAP_OPTIONS_ZOOM_CONTROL = "zoomControl";
    public static final String MAP_OPTIONS_STREET_VIEW = "streetView";
    public static final String MAP_OPTIONS_SCALE_CONTROL = "scaleControl";
    public static final String MAP_OPTIONS_ROTATE_CONTROL = "rotateControl";
    public static final String MAP_OPTIONS_OVERVIEW_CONTROL = "overviewControl";

    @RequestMapping
	public ModelAndView getView(RenderRequest request) throws Exception {
		Map<String,Object> map = new HashMap<String,Object>();
		
		PortletPreferences preferences = request.getPreferences();
		
        double startingLatitude = Double.parseDouble(preferences.getValue(PREFERENCE_STARTING_LATITUDE, "41.300937"));
        map.put(PREFERENCE_STARTING_LATITUDE, startingLatitude);
        
        double startingLongitude = Double.parseDouble(preferences.getValue(PREFERENCE_STARTING_LONGITUDE, "-72.932103"));
        map.put(PREFERENCE_STARTING_LONGITUDE, startingLongitude);

        int startingZoom = Integer.parseInt(preferences.getValue(PREFERENCE_STARTING_ZOOM, "18"));
        map.put(PREFERENCE_STARTING_ZOOM, startingZoom);

        boolean mapTypeControlBool = Boolean.parseBoolean(preferences.getValue(MAP_OPTION_MAPTYPE_CONTROL, "true"));
        map.put(MAP_OPTION_MAPTYPE_CONTROL, mapTypeControlBool);
        
        boolean panControlBool = Boolean.parseBoolean(preferences.getValue(MAP_OPTIONS_PAN_CONTROL, "false"));
        map.put(MAP_OPTIONS_PAN_CONTROL, panControlBool);
        
        boolean zoomControlBool = Boolean.parseBoolean(preferences.getValue(MAP_OPTIONS_ZOOM_CONTROL, "true"));
        map.put(MAP_OPTIONS_ZOOM_CONTROL, zoomControlBool);
        
        boolean streetViewBool = Boolean.parseBoolean(preferences.getValue(MAP_OPTIONS_STREET_VIEW, "true"));
        map.put(MAP_OPTIONS_STREET_VIEW, streetViewBool);
        
        boolean scaleControlBool = Boolean.parseBoolean(preferences.getValue(MAP_OPTIONS_SCALE_CONTROL, "true"));
        map.put(MAP_OPTIONS_SCALE_CONTROL, scaleControlBool);
        
        boolean rotateControlBool = Boolean.parseBoolean(preferences.getValue(MAP_OPTIONS_ROTATE_CONTROL, "false"));
        map.put(MAP_OPTIONS_ROTATE_CONTROL, rotateControlBool);
        
        boolean overviewControlBool = Boolean.parseBoolean(preferences.getValue(MAP_OPTIONS_OVERVIEW_CONTROL, "false"));
        map.put(MAP_OPTIONS_OVERVIEW_CONTROL, overviewControlBool);
        
        map.put("isHttps", request.isSecure());
		
		return new ModelAndView("mapView", map);
	}
    
}
