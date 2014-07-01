package org.jasig.portlet.maps.dao;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jasig.portlet.maps.model.xml.DefaultLocation;
import org.jasig.portlet.maps.model.xml.Location;
import org.jasig.portlet.maps.model.xml.MapData;

public class MapDataProcessor {
	final protected Log log = LogFactory.getLog(getClass());
	 /**
     * Perform data post-processing to set a search string for each location.
     * 
     * @param map
     */
    public void postProcessData(MapData map, double defaultLatitude, double defaultLongitude) {

        // set the default location
        final DefaultLocation defaultLocation = new DefaultLocation();
        defaultLocation.setLatitude(new BigDecimal(defaultLatitude));
        defaultLocation.setLongitude(new BigDecimal(defaultLongitude));
        map.setDefaultLocation(defaultLocation);
        
        // assemble a comma-delimited search string for each location
        // from the list of search keys, the location name, and the address (whatever is available, name is the minimum).
        for (Location location : map.getLocations()) {
            generateSearchText(location);
        }

    }

    /**
     * This validates the data provided - invalid locations will be removed from the map list of locations if any mandatory fields
     * are missing.
     * Lacking any abbreviation data from campus maps, I have substituted address for this field.
     * @param map
     */
	public void postProcessData(MapData map) {
		List<Location> validLocations = new ArrayList<Location>(map.getLocations().size());
		for (Location location : map.getLocations()) {
			if (locationIsValid(location)) {
				List<String> categories = location.getCategories();
				location.setAbbreviation(location.getAddress());
				generateSearchText(location);
				validLocations.add(location);
			}
		}
		map.getLocations().clear();
		map.getLocations().addAll(validLocations);
	}

	public boolean locationIsValid(Location location) {
		List<String> categories = location.getCategories();
		if (categories == null || categories.isEmpty() || location.getName() == null || location.getName().isEmpty()
				|| location.getLatitude() == null || location.getLongitude() == null) {
			log.warn("Rejecting data from cam maps php due to missing essential fields, data was : " + location.toString());
			return false;
		}
		return true;
	}
    
    private void generateSearchText(Location location) {
    	final StringBuffer searchString = new StringBuffer();
    	searchString.append(location.getName()!=null?location.getName().toLowerCase()+", ":"");
    	searchString.append(location.getAbbreviation()!=null?location.getAbbreviation().toLowerCase()+", ":"");
    	searchString.append(StringUtils.join(location.getSearchKeys(), ", "));
    	String text = searchString.toString();
		if (text.indexOf(",") != -1) {
			int lastCommaPos = text.lastIndexOf(",");
			if (text.trim().length() == lastCommaPos + 1) {
				text = text.substring(0, lastCommaPos);
			}
		}
    	location.setSearchText(text);
    }
}
