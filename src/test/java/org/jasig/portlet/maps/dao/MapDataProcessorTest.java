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

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.math.BigDecimal;

import javax.xml.bind.JAXBException;

import org.jasig.portlet.maps.model.xml.Location;
import org.jasig.portlet.maps.model.xml.MapData;
import org.junit.Before;
import org.junit.Test;

/**
 * @author Jen Bourey, jennifer.bourey@gmail.com
 * @version $Revision$
 */
public class MapDataProcessorTest {

    private MapDataProcessor proc = new MapDataProcessor();
	private Location location;
	private MapData data;
    
    @Before
    public void setUp() {
        data = new MapData();
        location = new Location();
        location.getCategories().add("BUSPUB");
        location.setLatitude(BigDecimal.TEN);
        location.setLongitude(BigDecimal.TEN);
        location.setName("Location Name");
        location.setAddress("ABBR");
    }
    
    @Test
    public void testPostProcessingNoNameLocationRemoved() {
        location.setName(null);
        assertEquals(0,data.getLocations().size());
        data.getLocations().add(location);
        assertEquals(1,data.getLocations().size());
        proc.postProcessData(data);
        assertEquals(0,data.getLocations().size());
        location.setName("");
        assertEquals(0,data.getLocations().size());
        data.getLocations().add(location);
        assertEquals(1,data.getLocations().size());
        proc.postProcessData(data);
        assertEquals(0,data.getLocations().size());
    }
    
    @Test 
    public void testPostProcessingNoCategoriesLocationRemoved() {
    	location.getCategories().clear();
        assertEquals(0,data.getLocations().size());
        data.getLocations().add(location);
        assertEquals(1,data.getLocations().size());
        proc.postProcessData(data);
        assertEquals(0,data.getLocations().size());
    }
    
    @Test 
    public void testPostProcessingAnyCategoryisOk() {
    	location.getCategories().clear();
    	location.getCategories().add("FANDABIDOZI");
        assertEquals(0,data.getLocations().size());
        data.getLocations().add(location);
        assertEquals(1,data.getLocations().size());
        proc.postProcessData(data);
        assertEquals(1,data.getLocations().size());
    }
    
    @Test 
    public void testPostProcessingNoLongitudeLocationRemoved()  {
        location.setLongitude(null);
        assertEquals(0,data.getLocations().size());
        data.getLocations().add(location);
        assertEquals(1,data.getLocations().size());
        proc.postProcessData(data);
        assertEquals(0,data.getLocations().size());
    }
    @Test 
    public void testPostProcessingNoLatitudeLocationRemoved()  {
        location.setLatitude(null);
        assertEquals(0,data.getLocations().size());
        data.getLocations().add(location);
        assertEquals(1,data.getLocations().size());
        proc.postProcessData(data);
        assertEquals(0,data.getLocations().size());
    }
    
    @Test
    public void testPostProcessingNoAddress()  {
        location.setAddress(null);
        location.getSearchKeys().add("search key 1");
        location.getSearchKeys().add("search key 2");
        data.getLocations().add(location);
        proc.postProcessData(data);
        assertEquals("location name, search key 1, search key 2", data.getLocations().get(0).getSearchText());
    }
    
    @Test
    public void testPostProcessingNoSearchKeys()  {
        data.getLocations().add(location);
        proc.postProcessData(data);
        assertEquals("location name, abbr", data.getLocations().get(0).getSearchText());
    }
    
    @Test
    public void testPostProcessingNoCampuses()  {
        data.getLocations().add(location);
        proc.postProcessData(data);
        assertEquals("location name, abbr", data.getLocations().get(0).getSearchText());
    }
    
    @Test
    public void testPostProcessingOneSearchKeys()  {
        location.getSearchKeys().add("search key 1");
        data.getLocations().add(location);
        proc.postProcessData(data);
        assertEquals("location name, abbr, search key 1", data.getLocations().get(0).getSearchText());
    }
    
}
