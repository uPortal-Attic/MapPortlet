package org.jasig.portlet.maps.dao;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import net.sf.ehcache.Element;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jasig.portlet.maps.model.xml.DefaultLocation;
import org.jasig.portlet.maps.model.xml.Location;
import org.jasig.portlet.maps.model.xml.MapData;
import org.owasp.validator.html.AntiSamy;
import org.owasp.validator.html.CleanResults;
import org.owasp.validator.html.Policy;
import org.owasp.validator.html.PolicyException;
import org.owasp.validator.html.ScanException;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Scheduled;

import com.google.map.kml.Document;
import com.google.map.kml.Kml;
import com.google.map.kml.Placemark;
import com.google.map.kml.Style;
import org.springframework.stereotype.Component;

@Component
public class GoogleMyMapsDaoImpl implements IMapDao {
    
    protected final Log log = LogFactory.getLog(getClass());

    private Map<String,String> categories;
    
    @Required
    public void setCategories(Map<String, String> categories) {
        this.categories = categories;
    }
    
    private Map<String,String> addresses;
    
    public void setAddresses(Map<String, String> addresses) {
        this.addresses = addresses;
    }
    
    private Resource kmlFile;
    
    @Value("${map.googlemymapsdao.file:classpath:/mymap.kml}")
    public void setKmlFile(Resource kmlFile) {
        this.kmlFile = kmlFile;
    }
    
    private double defaultLatitude;
    
    @Value("${map.default.latitude:41.300937}")
    public void setDefaultLatitude(double defaultLatitude) {
        this.defaultLatitude = defaultLatitude;
    }
    
    private double defaultLongitude;
    
    @Value("${map.default.longitude:-72.932103}")
    public void setDefaultLongitude(double defaultLongitude) {
        this.defaultLongitude = defaultLongitude;
    }
    
    private Policy policy;
    
    @Value("${map.policy.file:classpath:/antisamy-textonly.xml}")
    public void setPolicy(Resource policyFile) throws PolicyException, IOException {
        this.policy = Policy.getInstance(policyFile.getInputStream());
    }
    
    @Override
    @Cacheable("mapCache")
    public MapData getMap(String selectedMapDataUrl) {

        //todo change this method to use the string passed in
        
        final MapData map = new MapData();

        // read a Google My Maps KML feed from the local filesystem and parse 
        // it using JAXB
        Kml kml = null;
        try {
            JAXBContext jc = JAXBContext.newInstance(Kml.class);
            Unmarshaller u = jc.createUnmarshaller();
            kml = (Kml) u.unmarshal(kmlFile.getInputStream());
        } catch (JAXBException e) {
            log.error("Failed to parse KML file", e);
        } catch (FileNotFoundException e) {
            log.error("Failed to locate KML file", e);
        } catch (IOException e) {
            log.error("IO Exception reading KML file", e);
        }
        
        final Document doc = (Document) kml.getDocument();

        // iterate through the list of styles building up a map of style IDs
        // to category names
        final Map<String, String> styles = new HashMap<String, String>();
        for (Style style : doc.getStyle()) {
            if (!styles.containsKey(style.getId())) {
                final String iconUrl = style.getIconStyle().getIcon().getHref();
                if (categories.containsKey(iconUrl)) {
                    styles.put("#".concat(style.getId()), categories.get(iconUrl));
                }
            }
        }
        
        final AntiSamy as = new AntiSamy();
        
        // iterate through the list of placemarks, constructing a location for
        // each item
        int index = 0;
        for (final Placemark placemark : doc.getPlacemark()) {

            // create a new location, setting the name and description
            final Location location = new Location();
            location.setName(placemark.getName());
            
            try {
                final CleanResults cr = as.scan(placemark.getDescription(), policy);
                location.setDescription(cr.getCleanHTML());
            } catch (ScanException e) {
                log.warn("Exception scanning description", e);
            } catch (PolicyException e) {
                log.warn("Exception cleaning description", e);
            }
            
            if (this.addresses != null && this.addresses.containsKey(placemark.getName())) {
                location.setAddress(this.addresses.get(placemark.getName()));
            }
            
            // set the coordinates for the location
            final String[] coordinates = placemark.getPoint().getCoordinates().split(",");
            location.setLatitude(new BigDecimal(Double.parseDouble(coordinates[1])));
            location.setLongitude(new BigDecimal(Double.parseDouble(coordinates[0])));

            // set the abbreviation to the index number just so we have a 
            // unique ID
            location.setAbbreviation(String.valueOf(index));
            index++;

            // if the style ID is mapped to a map category, add the category
            // to this location
            if (styles.containsKey(placemark.getStyleUrl())) {
                location.getCategories().add(styles.get(placemark.getStyleUrl()));
            }
            
            map.getLocations().add(location);
            
        }
        
        postProcessData(map);
        return map;
    }

    /**
     * Perform data post-processing to set a search string for each location.
     * 
     * @param map
     */
    protected void postProcessData(MapData map) {

        // set the default location
        final DefaultLocation defaultLocation = new DefaultLocation();
        defaultLocation.setLatitude(new BigDecimal(defaultLatitude));
        defaultLocation.setLongitude(new BigDecimal(defaultLongitude));
        map.setDefaultLocation(defaultLocation);
        
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
