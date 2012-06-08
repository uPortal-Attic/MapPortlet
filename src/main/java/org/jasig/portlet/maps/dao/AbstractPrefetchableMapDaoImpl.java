package org.jasig.portlet.maps.dao;

import javax.portlet.PortletRequest;

import net.sf.ehcache.Cache;
import net.sf.ehcache.Element;

import org.jasig.portlet.maps.model.xml.MapData;
import org.springframework.beans.factory.annotation.Required;

public abstract class AbstractPrefetchableMapDaoImpl implements IPrefetchableMapDao {

    protected final static String CACHE_KEY = "map";
    
    private Cache cache;
    
    /**
     * @param cache the cache to set
     */
    @Required
    public void setCache(Cache cache) {
        this.cache = cache;
    }
    
    public Cache getCache() {
        return this.cache;
    }
    
    @Override
    public MapData getMap(PortletRequest request) {
        Element cachedMap = this.cache.get(CACHE_KEY);
        if (cachedMap == null) {
            prefetchMap();
            cachedMap = this.cache.get(CACHE_KEY);
        }
        return (MapData) cachedMap.getValue();
    }

}
