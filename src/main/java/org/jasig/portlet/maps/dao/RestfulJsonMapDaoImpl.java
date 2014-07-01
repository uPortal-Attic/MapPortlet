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

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jasig.portlet.maps.model.xml.MapData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Restful JSON map DAO retrieves map data from a static JSON file hosted from within the portlet itself or at a specified URL.
 * 
 * @author Jen Bourey, jennifer.bourey@gmail.com
 * @version $Revision$
 */
@Component
public class RestfulJsonMapDaoImpl implements IMapDao {

	final protected Log log = LogFactory.getLog(getClass());

	private RestTemplate restTemplate;
	/* this does NOT need to be threadsafe */
	private Long lastModifiedDate;
	/* this does NOT need to be threadsafe */
	private MapData mapData;
	/* this does NOT need to be threadsafe */
	private MapDataProcessor mapProcessor = new MapDataProcessor();

	@Autowired(required = true)
	public void setRestTemplate(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	@Override
	public MapData getMap(String selectedMapDataUrl) {
		log.debug("Fetching json data file from URL " + selectedMapDataUrl);
		HttpHeaders headers = new HttpHeaders();
		List<MediaType> acceptableMediaTypes = new ArrayList<MediaType>();
		acceptableMediaTypes.add(MediaType.APPLICATION_JSON);
		headers.setAccept(acceptableMediaTypes);
		// happens after a reboot
		if (lastModifiedDate == null) {
			Calendar cal = Calendar.getInstance();
			Date today = cal.getTime();
			cal.add(Calendar.YEAR, -100);
			long oneHundredYsearAgo = cal.getTime().getTime();
			headers.setIfModifiedSince(oneHundredYsearAgo);
			doMapRequest(selectedMapDataUrl, headers);
		} else {
			headers.setIfModifiedSince(lastModifiedDate);
			if (doResponseCodeRequest(selectedMapDataUrl, headers) != HttpStatus.NOT_MODIFIED) {
				doMapRequest(selectedMapDataUrl, headers);
			}
		}
		return mapData;
	}

	private HttpStatus doResponseCodeRequest(String selectedMapDataUrl, HttpHeaders headers) {
		ResponseEntity<MapData> mapResponse = restTemplate.exchange(selectedMapDataUrl, HttpMethod.GET, new HttpEntity<String>(headers),
				null);
		return mapResponse.getStatusCode();
	}

	/* Gets the map and replaces the existing mapdata with it, also replaces the existing lastmodified date */
	private void doMapRequest(String selectedMapDataUrl, HttpHeaders headers) {
		ResponseEntity<MapData> mapResponse = restTemplate.exchange(selectedMapDataUrl, HttpMethod.GET, new HttpEntity<String>(headers),
				MapData.class, Collections.<String, String> emptyMap());
		lastModifiedDate = mapResponse.getHeaders().getLastModified();
		MapData map = mapResponse.getBody();
		// perform any required post-processing
		mapProcessor.postProcessData(map);
		mapData = map;
	}

	@Override
	public String getVersion() {
		return ""+lastModifiedDate;
	}

}
