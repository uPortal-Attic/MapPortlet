package org.jasig.portlet.maps.tools;

import java.util.Comparator;

import org.apache.commons.lang.builder.CompareToBuilder;
import org.jasig.portlet.maps.model.xml.Location;

public class ByNameLocationComparator implements Comparator<Location> {

    @Override
    public int compare(Location location1, Location location2) {
        return new CompareToBuilder()
            .append(location1.getName(), location2.getName())
            .append(location1.getAbbreviation(), location2.getAbbreviation())
            .toComparison();
    }

}
