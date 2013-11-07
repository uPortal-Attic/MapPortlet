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

package org.jasig.portlet.maps.dao;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jasig.portlet.maps.model.xml.Location;
import org.jasig.portlet.maps.model.xml.MapData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

/**
 * Restful JSON map DAO retrieves map data from a static JSON file hosted from within
 * the portlet itself or at a specified URL.
 *  
 * @author Jen Bourey, jennifer.bourey@gmail.com
 * @version $Revision$
 */
@Component
public class RestfulJsonMapDaoImpl implements IMapDao {

    final protected Log log = LogFactory.getLog(getClass());
    
    private RestTemplate restTemplate;

    @Autowired(required = true)
    public void setRestTemplate(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    @Override
    @Cacheable("mapCache")
    public MapData getMap(String selectedMapDataUrl) {
        log.debug("Fetching json data file from URL " + selectedMapDataUrl);
        final MapData map = restTemplate.getForObject(selectedMapDataUrl,
                MapData.class, Collections.<String, String> emptyMap());

        // perform any required post-processing
        postProcessData(map);
        return map;
    }

    /**
     * Perform data post-processing to set a search string for each location.
     * 
     * @param map
     */
    protected void postProcessData(MapData map) {

        // assemble a tilde-delimited search string for each location
        // from the list of search keys, the location name, and the address
        for (Location location : map.getLocations()) {
            final StringBuffer searchString = new StringBuffer();
            searchString.append(location.getName().toLowerCase());
            searchString.append("~");
            searchString.append(location.getAbbreviation().toLowerCase());
            searchString.append("~");
            searchString.append(StringUtils.join(location.getSearchKeys(), "~"));
            location.setSearchText(searchString.toString());
        }

    }
    
}
