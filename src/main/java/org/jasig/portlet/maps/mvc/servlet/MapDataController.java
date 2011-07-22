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

package org.jasig.portlet.maps.mvc.servlet;

import org.apache.commons.io.IOUtils;
import org.jasig.portlet.maps.data.IMapDataSource;

import java.io.ByteArrayInputStream;
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
    
    private IMapDataSource dataSource;
    
    @RequestMapping(value="/locations.json", method = RequestMethod.GET)
    public void getData(HttpServletResponse response) throws IOException {
        byte[] mapData = dataSource.getDataAsString().getBytes();
        response.setContentType("application/json;charset=UTF-8");
        response.setContentLength(mapData.length);
        
        InputStream stream = new ByteArrayInputStream(mapData);
        
        OutputStream output = response.getOutputStream();
        OutputStreamWriter out = new OutputStreamWriter(output , "UTF-8");
        
        IOUtils.copy(stream, output);
        
        out.flush();
        out.close();
    }

    public void setApplicationContext(ApplicationContext context)
            throws BeansException {
        this.dataSource = (IMapDataSource) context.getBean("dataSource");
    }

}
