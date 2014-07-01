    API-Key:
    
The preference 'apiKey' in portlet.xml has been left empty and should be replaced with a valid key issued by Google.

	defaultMapInfoHeader:
	
This new preference in portlet.xml sets the title of the Map.

	Javascript dependencies:

jQuery Mobile 1.3.2 is required along with jQuery (1.9+) and the jQuery migrate plugin (1.2.1+). The version of Fluid used is
1.4.0-upmc. 

	Configuration:

Modify values in the file filters/local.properties as needed. The pom file defaults to setting env to be local, use -Denv='X' for other environments.

	Data Structure:
	
This version uses the same xml schema as the main Maps Portlet, however the following fields:
 
 name, campuses, categories, longitude and latitude - are mandatory. 
 
 Description and address are used but not mandatory and all other fields in the feed are currently ignored. 
 Items in the feed lacking mandatory elements are rejected and logged.