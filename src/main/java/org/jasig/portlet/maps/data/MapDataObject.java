package org.jasig.portlet.maps.data;

import net.sf.json.JSON;
import net.sf.json.JSONObject;

public class MapDataObject {
    private String abbreviation;
    private String address;
    private String alternateName;
    private String name;
    private float latitude;
    private float longitude;
    private String searchText;
    private int zip;
    private String imgURL;
    
    
    public MapDataObject() { }
    
    public MapDataObject(String abbreviation, String address, String alternateName, String name, float latitude,
            float longitude, String searchText, short zip, String imgURL)
    {
        this.abbreviation = abbreviation;
        this.address = address;
        this.alternateName = alternateName;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.searchText = searchText;
        this.zip = zip;
        this.imgURL = imgURL;
    }
    
    /*
     * returns in the form of JSON.
     * This seemed more efficient than just storing at as a JSON object so parsing isn't required to access non-strings
     */
    public JSON toJSON()
    {
        JSONObject returnedObject = new JSONObject();
        returnedObject.put("abbreviation", abbreviation);
        returnedObject.put("address", address);
        returnedObject.put("alternateName", alternateName);
        returnedObject.put("name", name);
        returnedObject.put("latitude", latitude);
        returnedObject.put("longitude", longitude);
        returnedObject.put("searchText", searchText);
        returnedObject.put("zip", zip);
        returnedObject.put("imgURL", imgURL);
        return returnedObject;
    }
    
    public void setAbbreviation(String abbreviation) {
        this.abbreviation = abbreviation;
    }
    public String getAbbreviation() {
        return abbreviation;
    }
    public void setAddress(String address) {
        this.address = address;
    }
    public String getAddress() {
        return address;
    }
    public void setAlternateName(String alternateName) {
        this.alternateName = alternateName;
    }
    public String getAlternateName() {
        return alternateName;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
    public void setLatitude(float latitude) {
        this.latitude = latitude;
    }
    public float getLatitude() {
        return latitude;
    }
    public void setLongitude(float longitude) {
        this.longitude = longitude;
    }
    public float getLongitude() {
        return longitude;
    }
    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }
    public String getSearchText() {
        return searchText;
    }
    public void setZip(int zip) {
        this.zip = zip;
    }
    public int getZip() {
        return zip;
    }
    public void setImgURL(String imgURL) {
        this.imgURL = imgURL;
    }
    public String getImgURL() {
        return imgURL;
    }
}
