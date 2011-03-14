package org.jasig.portlet.maps.mvc.portlet;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("VIEW")
public class MapViewController {

    @RequestMapping
    public String getMapView() {
        return "mapView";
    }
    
}
