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

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.portlet.*;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jasig.portlet.maps.dao.IMapDao;
import org.jasig.portlet.maps.model.xml.DefaultLocation;
import org.jasig.portlet.maps.model.xml.MapData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.portlet.ModelAndView;
import org.springframework.web.portlet.bind.annotation.ResourceMapping;

@Controller
@RequestMapping("VIEW")
public class MapViewController {

    public static final String PREFERENCE_API_KEY = "apiKey";
    public static final String PREFERENCE_USE_PORTAL_JS_LIBS = "usePortalJsLibs";
    public static final String PREFERENCE_PORTAL_JS_NAMESPACE = "portalJsNamespace";
    public static final String PREFERENCE_STARTING_LATITUDE ="latitude";
    public static final String PREFERENCE_STARTING_LONGITUDE ="longitude";
    public static final String PREFERENCE_STARTING_ZOOM = "zoom";
    public static final String PREFERENCE_MAP_DATA_URL = "mapDataUrl";
    public static final String MAP_OPTION_MAPTYPE_CONTROL = "mapTypeControl";
    public static final String MAP_OPTIONS_PAN_CONTROL = "panControl";
    public static final String MAP_OPTIONS_ZOOM_CONTROL = "zoomControl";
    public static final String MAP_OPTIONS_STREET_VIEW = "streetView";
    public static final String MAP_OPTIONS_SCALE_CONTROL = "scaleControl";
    public static final String MAP_OPTIONS_ROTATE_CONTROL = "rotateControl";
    public static final String MAP_OPTIONS_OVERVIEW_CONTROL = "overviewControl";

    final protected Log log = LogFactory.getLog(getClass());
    private IMapDao dao;
    
    @Autowired(required = true)
    public void setMapDao(IMapDao dao) {
        this.dao = dao;
    }

    private String mapDataUrl;

    @Value("${map.defaultdao.url:http://localhost:8080/MapPortlet/data/map.json}")
    public void setMapDataUrl(String mapDataUrl) {
        this.mapDataUrl = mapDataUrl;
    }

    private String portalProtocol;

    @Value("${portal.protocol:http}")
    public void setPortalProtocol(String portalProtocol) {
        this.portalProtocol = portalProtocol;
    }

    private String defaultLatitude;
    
    @Value("${map.default.latitude:41.300937}")
    public void setDefaultLatitude(String defaultLatitude) {
        this.defaultLatitude = defaultLatitude;
    }
    
    private String defaultLongitude;
    
    @Value("${map.default.longitude:-72.932103}")
    public void setDefaultLongitude(String defaultLongitude) {
        this.defaultLongitude = defaultLongitude;
    }
    
    private String defaultZoom;
    
    @Value("${map.default.zoom:17}")
    public void setDefaultZoom(String defaultZoom) {
        this.defaultZoom = defaultZoom;
    }
    
    @RequestMapping
	public ModelAndView getView(RenderRequest request, @RequestParam(required=false) String location) throws Exception {
		Map<String,Object> map = new HashMap<String,Object>();

        log.debug("Getting map data during render request");
        MapData mapData = getMapData(request);

		PortletPreferences preferences = request.getPreferences();
		
		String apiKey = preferences.getValue(PREFERENCE_API_KEY, null);
		map.put(PREFERENCE_API_KEY, apiKey);

        DefaultLocation defaultLocation = mapData.getDefaultLocation();
        Double startingLatitude = getLatOrLong(preferences,
                defaultLocation != null ? defaultLocation.getLatitude() : null,
                PREFERENCE_STARTING_LATITUDE, defaultLatitude);
        map.put(PREFERENCE_STARTING_LATITUDE, startingLatitude);

        Double startingLongitude = getLatOrLong(preferences,
                defaultLocation != null ? defaultLocation.getLongitude() : null,
                PREFERENCE_STARTING_LONGITUDE, defaultLongitude);
        map.put(PREFERENCE_STARTING_LONGITUDE, startingLongitude);

        int startingZoom = Integer.parseInt(preferences.getValue(PREFERENCE_STARTING_ZOOM, defaultZoom));
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

        map.put(PREFERENCE_USE_PORTAL_JS_LIBS, preferences.getValue(PREFERENCE_USE_PORTAL_JS_LIBS, "true"));
        map.put(PREFERENCE_PORTAL_JS_NAMESPACE, preferences.getValue(PREFERENCE_PORTAL_JS_NAMESPACE, "up"));

        map.put("portalProtocol", portalProtocol);
        map.put("isMobile", "UniversalityMobile".equals(request.getProperty("themeName")));
        map.put("location", location);
		
		return new ModelAndView("mapView", map);
	}

    private MapData getMapData(PortletRequest request) {
        PortletPreferences preferences = request.getPreferences();
        String selectedMapDataUrl = preferences.getValue(PREFERENCE_MAP_DATA_URL, null);
        if (StringUtils.isBlank(selectedMapDataUrl)) {
            selectedMapDataUrl = this.mapDataUrl;
        }

        log.debug("Requesting map data from " + selectedMapDataUrl);
        return dao.getMap(selectedMapDataUrl);
    }

    /**
     * Get the Lat or Long value, giving preference to
     * 1) Portlet preference value
     * 2) value specified in map file
     * 3) fail safe default
     * @param preferences
     * @param mapValue
     * @param preferenceName
     * @param defaultValue
     * @return
     */
    private Double getLatOrLong (PortletPreferences preferences, BigDecimal mapValue,
                                 String preferenceName, String defaultValue) {
        String preferenceValue = preferences.getValue(preferenceName, null);
        if (preferenceValue != null) {
            return Double.parseDouble(preferenceValue);
        }
        else if (mapValue != null) {
            return mapValue.doubleValue();
        }
        return Double.parseDouble(defaultValue);
    }
    
    @ResourceMapping 
    public ModelAndView getMapData(ResourceRequest request, ResourceResponse response) {

        log.debug("Getting map data during resource request");
        MapData mapData = getMapData(request);
        String etag = String.valueOf(mapData.hashCode());
        String requestEtag = request.getETag();
        
        // if the request ETag matches the hash for this response, send back
        // an empty response indicating that cached content should be used
        if (request.getETag() != null && etag.equals(requestEtag)) {
            response.getCacheControl().setExpirationTime(360);
            response.getCacheControl().setUseCachedContent(true);
            response.setProperty(ResourceResponse.HTTP_STATUS_CODE, Integer.toString(HttpServletResponse.SC_NOT_MODIFIED));
            // returning null appears to cause the response to be committed
            // before returning to the portal, so just use an empty view
            return new ModelAndView("json", Collections.<String,String>emptyMap());
        }
        
        // create new content with new validation tag
        response.getCacheControl().setETag(etag);
        response.getCacheControl().setExpirationTime(360);
        
        ModelAndView mv = new ModelAndView("json");
        mv.addObject(mapData);
        return mv;
    }
    
}
