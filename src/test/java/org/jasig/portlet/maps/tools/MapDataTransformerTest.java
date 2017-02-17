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

import static org.junit.Assert.assertEquals;

import org.jasig.portlet.maps.model.xml.Location;
import org.jasig.portlet.maps.model.xml.MapData;
import org.junit.Test;

public class MapDataTransformerTest {

    @Test
    public void testNullAbbreviations() {
        MapData data = new MapData();
        Location location = new Location();
        location.setName("Location A");
        data.getLocations().add(location);
        location = new Location();
        location.setName("Location B");
        data.getLocations().add(location);
        
        MapDataTransformer.setAbbreviations(data);
        assertEquals("LocationA", data.getLocations().get(0).getAbbreviation());
        assertEquals("LocationB", data.getLocations().get(1).getAbbreviation());
    }
    
    @Test
    public void testDuplicateNullAbbreviations() {
        MapData data = new MapData();
        Location location = new Location();
        location.setName("Location A");
        data.getLocations().add(location);
        location = new Location();
        location.setName("Location A");
        data.getLocations().add(location);
        location = new Location();
        location.setName("Location A");
        data.getLocations().add(location);
        
        MapDataTransformer.setAbbreviations(data);
        assertEquals("LocationA", data.getLocations().get(0).getAbbreviation());
        assertEquals("LocationA1", data.getLocations().get(1).getAbbreviation());
        assertEquals("LocationA2", data.getLocations().get(2).getAbbreviation());
    }
    
    @Test
    public void testDuplicateAbbreviations() {
        MapData data = new MapData();
        Location location = new Location();
        location.setName("Location A");
        location.setAbbreviation("loca");
        data.getLocations().add(location);
        location = new Location();
        location.setName("Location A");
        location.setAbbreviation("loca");
        data.getLocations().add(location);
        
        MapDataTransformer.setAbbreviations(data);
        assertEquals("loca", data.getLocations().get(0).getAbbreviation());
        assertEquals("LocationA", data.getLocations().get(1).getAbbreviation());
    }
    
}
