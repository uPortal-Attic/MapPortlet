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
