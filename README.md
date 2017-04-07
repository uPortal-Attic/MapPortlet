# Map Portlet

[![Linux Build Status](https://travis-ci.org/Jasig/MapPortlet.svg?branch=master)](https://travis-ci.org/Jasig/MapPortlet)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/gi1nk831v4145wso/branch/master?svg=true)](https://ci.appveyor.com/project/ChristianMurphy/mapportlet/branch/master)

The Map Portlet is a JSR-286 portlet includes an API for representing campus locations, including geo coordinates, addresses, categories, etc. Users can search/browse to find particular locations

## Features

*   Display Map with markers
*   API for representing campus locations
*   Search or Browse locations


## Configuration Information

The portlet has one property file: *configuration.properties* and one map file: *map.json*

1.  Check out project from <https://github.com/Jasig/MapPortlet>
2.  Configure *src/main/resources/configuration.properties*
3.  Run `mvn install`
4.  Deploy the war

### Map Properties

| Field        | Description                                                            |
| ------------ | ---------------------------------------------------------------------- |
| latitude     | latitude of location                                                   |
| longitude    | longitude of location                                                  |
| name         | Name of location.  Displayed to user and available in searches         |
| abbreviation | Abbreviation of location.  Displayed to user and available in searches |
| address      | Postal address of location                                             |
| description  | Description to display to users when location is selected              |
| img          | URL of image to display to user                                        |
| searchText   | Do not specify.  Field is constructed from name and abbreviation       |
| searchKeys   | List of additional strings included in user searches                   |
| categories   | List of categories for 'Browse by category' function.                  |
| campuses     |                                                                        |

### Portlet Preferences

| Preference Name | Default    | Description                               |
| --------------- | ---------- | ----------------------------------------- |
| apiKey          |            | API key to use for Google Maps            |
| latitude        | 41.300937  | Latitude to display for initial map view  |
| longitude       | -72.932103 | Longitude to display for initial map view |
| zoom            | 17         |                                           |
| mapTypeControl  | true       |                                           |
| panControl      | false      |                                           |
| zoomControl     | true       |                                           |
| streetView      | true       |                                           |
| scaleControl    | true       |                                           |
| rotateControl   | false      |                                           |
| overviewControl | false      |                                           |
