package org.jasig.portlet.maps.data.impl;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;

import javax.sql.DataSource;

import net.sf.json.JSON;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.io.IOUtils;
import org.jasig.portlet.maps.data.MapDataObject;
import org.jasig.portlet.maps.data.IMapDataSource;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.io.Resource;


public class MapDataSourceFileImpl implements IMapDataSource, ApplicationContextAware {

    private Resource mapData;
    public static final String BUILDING_KEY = "buildings"; // used to always access the buildings in the mapData in JSON files.
    
    public JSONObject getDataAsJSON() {
        JSONObject mainJSON = null;
        try {
            InputStream stream = new FileInputStream(mapData.getFile());
            
            String JSONText = IOUtils.toString(stream);
            mainJSON = JSONObject.fromObject(JSONText);
        } catch (Exception e)
        {//TODO make this actually output to a log4j logger
            System.out.println(e);
        }
        
        return mainJSON;
    }

    public void storeBuildingData(MapDataObject newBuildingData) {
        try {
            if (mapData.getFile().canWrite())
            {
                // get JSON data from the file.
                InputStream stream = new FileInputStream(mapData.getFile());
                JSONObject theLocationData = JSONObject.fromObject(IOUtils.toString(stream)); 
                // add the new data to the JSON data
                JSONArray buildings= JSONArray.fromObject(theLocationData.get(BUILDING_KEY)); // the Key is in the Map Data Object for simplicity
                buildings.add(newBuildingData.toJSON());
                
                theLocationData.element(BUILDING_KEY, buildings);
                // put the data back into the file.
                File file = mapData.getFile();
                FileWriter fWriter = new FileWriter(file.getPath(), false);
                BufferedWriter output = new BufferedWriter(fWriter);
                output.write(theLocationData.toString());
                output.close();
            }
            else
            {
                System.out.println("MapPortlet:  The file is not writable");
            }
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void setApplicationContext(ApplicationContext context)
        throws BeansException {
        mapData = context.getResource("classpath:mapData.json");
    }

    public String getDataAsString() {
        String JSONText ="";
        try {
            InputStream stream = new FileInputStream(mapData.getFile());
            
            JSONText = IOUtils.toString(stream);
        } catch (Exception e)
        {//TODO make this actually output to a log4j logger
            System.out.println(e);
        }
        return JSONText;
    }

    public void setDefaultLocation(MapDataObject newBuildingData) {
        // TODO make this so it gets the default location, and replaces it with the new Building data
        
    }


    
}
