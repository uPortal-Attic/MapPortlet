/**
 * Licensed to Apereo under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Apereo licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License.  You may obtain a
 * copy of the License at the following location:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.jasig.portlet.maps.tools;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.jasig.portlet.maps.model.xml.Location;
import org.jasig.portlet.maps.model.xml.MapData;
import org.springframework.http.converter.json.MappingJacksonHttpMessageConverter;
import org.springframework.web.client.RestTemplate;

public class MapDataTransformer {

    private static ObjectMapper mapper = new ObjectMapper();
    
    private static RestTemplate restTemplate = new RestTemplate();
    
    // http://code.google.com/apis/maps/documentation/geocoding/
    private static String geocodingUrl = "http://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&sensor=false";

    static {
        restTemplate.getMessageConverters().add(new MappingJacksonHttpMessageConverter());
    }
    
    /**
     * @param args
     */
    public static void main(String[] args) {

        // translate the KML file to the map portlet's native data format
        File kml = new File("map-data.xml");
        File xslt = new File("google-earth.xsl");
        
        try {
            TransformerFactory transFact = javax.xml.transform.TransformerFactory.newInstance( );
            Transformer trans = transFact.newTransformer(new StreamSource(xslt));
            trans.transform(new StreamSource(kml), new StreamResult(System.out));
        } catch (TransformerConfigurationException e) {
            e.printStackTrace();
        } catch (TransformerException e) {
            e.printStackTrace();
        }
        
        // deserialize the map data from XML
        MapData data = null;
        try {
            JAXBContext jc = JAXBContext.newInstance(MapData.class);
            Unmarshaller u = jc.createUnmarshaller();
            data = (MapData)u.unmarshal(new FileInputStream(new File("map-data-transformed.xml")));
        } catch (JAXBException e1) {
            e1.printStackTrace();
            return;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return;
        }

        // ensure each location has a unique, non-null abbreviation
        setAbbreviations(data);

        // update each location with an address
//        setAddresses(data);
        
        // sort locations by name
        Collections.sort(data.getLocations(), new ByNameLocationComparator());
        
        // serialize new map data out to a file into JSON format
        try {
            mapper.defaultPrettyPrintingWriter().writeValue(new File("map.json"), data);
        } catch (JsonGenerationException e) {
            System.out.println("Error generating JSON data for map");
            e.printStackTrace();
        } catch (JsonMappingException e) {
            System.out.println("Error generating JSON data for map");
            e.printStackTrace();
        } catch (IOException e) {
            System.out.println("Error writing JSON data to map file");
            e.printStackTrace();
        }

    }
    
    /**
     * Update the provided MapData abbreviations, ensuring each location
     * has a unique and non-null ID.
     * 
     * @param data
     */
    protected static void setAbbreviations(MapData data) {
        
        // initialize a set for tracking in-use IDs so that we can ensure each
        // abbreviation is unique
        Set<String> usedIds = new HashSet<String>();
        
        for (Location location : data.getLocations()) {
            
            // if the location already has an abbreviation set and it is not
            // a duplicate, just go ahead and use it
            if (StringUtils.isNotBlank(location.getAbbreviation())
                    && !usedIds.contains(location.getAbbreviation())) {
                usedIds.add(location.getAbbreviation());
            } 
            
            // otherwise create an automated ID for the location
            else {
                
                // create a default ID from the location name
                String defaultId = location.getName().replaceAll("[^a-zA-Z0-9]", "");

                // if this ID hasn't been used yet, go ahead and use it
                if (!usedIds.contains(defaultId)) {
                    location.setAbbreviation(defaultId);
                    usedIds.add(defaultId);
                } 

                // otherwise, add a progressively bigger index to the name until
                // we have a unique ID
                else {
                    int idx = 1;
                    String id = defaultId.concat(String.valueOf(idx));
                    while (usedIds.contains(id)) {
                        idx++;
                        id = defaultId.concat(String.valueOf(idx));
                    }
                    location.setAbbreviation(id);
                    usedIds.add(id);
                } 

            }
        }
    }
    
    /**
     * Update the provided MapData, ensuring each location has an address.
     * 
     * @param data
     */
    protected static void setAddresses(MapData data) {
        for (Location location : data.getLocations()) {
            if (StringUtils.isBlank(location.getAddress())) {
                Map<String,Object> coordinates = new HashMap<String,Object>();
                coordinates.put("lat", location.getLatitude());
                coordinates.put("lng", location.getLongitude());
                Map response = restTemplate.getForObject(geocodingUrl, Map.class, coordinates);
                System.out.println(response);
                List results = (List) response.get("results");
                if (results.size() > 0) {
                    String address = (String) ((Map) results.get(0)).get("formatted_address");
                    if (address != null) {
                        location.setAddress(address);
                    }
                }
            }
        }
    }

}
