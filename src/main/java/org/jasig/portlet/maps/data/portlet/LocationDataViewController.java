package org.jasig.portlet.maps.data.portlet;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.PortletPreferences;
import javax.portlet.PortletRequest;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.jasig.portlet.maps.data.MapDataObject;
import org.jasig.portlet.maps.data.IMapDataSource;
import org.omg.CORBA.portable.Streamable;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.portlet.ModelAndView;
import org.springframework.web.portlet.mvc.SimpleFormController;
import net.sf.json.JSON;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

@Controller
@RequestMapping("VIEW")
public class LocationDataViewController implements ApplicationContextAware {
 
    private IMapDataSource dataSource;


    @RequestMapping
    public ModelAndView getView(RenderRequest request) throws Exception {

        
        // putting stuff into the map
        Map<String,Object> map = new HashMap<String,Object>();
        
        int startNum;
        int itemNum = 10;// presently hardcoded to 10.  TODO: move to portlet prefs
        int endNum;
        // Gets the 'start" to allow paging
        try {
            String start = request.getParameter("start");
            startNum = Integer.parseInt(start);
        } catch (Exception e)
        {
            startNum = 0;
        }
        map.put("items", itemNum); // the number displayed per page.
        map.put("start", startNum);
        
        
        
        JSONObject mainJSON = dataSource.getDataAsJSON();
        JSONArray buildings = (JSONArray) mainJSON.get("buildings");
        
        // makes sure its not about to try and draw more than the total number of objects
        endNum = startNum + itemNum;
        if (endNum >= buildings.size())
        { endNum = buildings.size()-1; }
        map.put("totalItems",buildings.size()); // get total list of buildings
        
        buildings = JSONArray.fromObject(buildings.subList(startNum, endNum));
        map.put("buildings",buildings);
        
        
        
        map.put("newBuildingData", new MapDataObject());
        
        
        return new ModelAndView("dataView", map);
    }
    
    public void setApplicationContext(ApplicationContext context)
    throws BeansException {
        this.dataSource = (IMapDataSource) context.getBean("dataSource");
    }
    
    @RequestMapping(method = RequestMethod.POST)
    public void onSubmit(
            @ModelAttribute("newBuildingData") MapDataObject newBuildingData)//,
            //HttpServletResponse response)
    {
        dataSource.storeBuildingData(newBuildingData);
    }

    public void setDataSource(IMapDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public IMapDataSource getDataSource() {
        return dataSource;
    }
}
