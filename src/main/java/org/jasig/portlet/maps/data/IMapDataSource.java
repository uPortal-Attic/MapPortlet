package org.jasig.portlet.maps.data;

import net.sf.json.JSON;
import net.sf.json.JSONObject;

public interface IMapDataSource {

    public abstract JSONObject getDataAsJSON();// returns the data needed for the map as JSON. This includes the default location.
    
    public abstract String getDataAsString(); // returns the data needed for the map as a String, which should be able to be parsed to JSON
    
    public abstract void storeBuildingData(MapDataObject newBuildingData);
    
    public abstract void setDefaultLocation(MapDataObject newBuildingData);
}
