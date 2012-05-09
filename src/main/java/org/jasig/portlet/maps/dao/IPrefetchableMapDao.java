package org.jasig.portlet.maps.dao;

import org.jasig.portlet.maps.model.xml.MapData;

public interface IPrefetchableMapDao extends IMapDao {
    
    public MapData prefetchMap();

}
