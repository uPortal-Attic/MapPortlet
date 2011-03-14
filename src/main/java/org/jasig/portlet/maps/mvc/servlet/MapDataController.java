package org.jasig.portlet.maps.mvc.servlet;

import org.apache.commons.io.IOUtils;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class MapDataController implements ApplicationContextAware {
    
    private Resource mapData;
    
    @RequestMapping(value="/locations.json", method = RequestMethod.GET)
    public void getData(HttpServletResponse response) throws IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        response.setContentLength((int) mapData.getFile().length());
        
        InputStream stream = mapData.getInputStream();
        
        OutputStream output = response.getOutputStream();
        OutputStreamWriter out = new OutputStreamWriter(output , "UTF-8");
        
        IOUtils.copy(stream, output);
        
        out.flush();
        out.close();
    }

    public void setApplicationContext(ApplicationContext context)
            throws BeansException {
        this.mapData = context.getResource("classpath:mapData.json");
    }

}
