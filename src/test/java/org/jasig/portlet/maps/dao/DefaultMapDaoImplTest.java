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

package org.jasig.portlet.maps.dao;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import java.io.IOException;

import javax.portlet.PortletRequest;
import javax.xml.bind.JAXBException;

import org.jasig.portlet.maps.model.xml.Location;
import org.jasig.portlet.maps.model.xml.MapData;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

/**
 * @author Jen Bourey, jennifer.bourey@gmail.com
 * @version $Revision$
 */
public class DefaultMapDaoImplTest {

    @Mock PortletRequest request;
    DefaultMapDaoImpl dao = new DefaultMapDaoImpl();        
    
    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
    }
    
    @Test
    public void testPostProcessing() throws JAXBException, IOException {
        MapData data = new MapData();
        Location location = new Location();
        location.setName("Location Name");
        location.setAbbreviation("ABBR");
        location.getSearchKeys().add("search key 1");
        location.getSearchKeys().add("search key 2");
        data.getLocations().add(location);
        
        dao.postProcessData(data);
        
        assertEquals("location name~abbr~search key 1~search key 2", data.getLocations().get(0).getSearchText());
        
    }
    
}
