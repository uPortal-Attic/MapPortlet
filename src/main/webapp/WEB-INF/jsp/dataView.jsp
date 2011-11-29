<%--

    Licensed to Jasig under one or more contributor license
    agreements. See the NOTICE file distributed with this work
    for additional information regarding copyright ownership.
    Jasig licenses this file to you under the Apache License,
    Version 2.0 (the "License"); you may not use this file
    except in compliance with the License. You may obtain a
    copy of the License at:

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied. See the License for the
    specific language governing permissions and limitations
    under the License.

--%>

<jsp:directive.include file="/WEB-INF/jsp/include.jsp"/>
<link href="<c:url value="/css/map.css"/>" rel="stylesheet" type="text/css" />
<!--

    Licensed to Jasig under one or more contributor license
    agreements. See the NOTICE file distributed with this work
    for additional information regarding copyright ownership.
    Jasig licenses this file to you under the Apache License,
    Version 2.0 (the "License"); you may not use this file
    except in compliance with the License. You may obtain a
    copy of the License at:

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied. See the License for the
    specific language governing permissions and limitations
    under the License.

-->
<!-- assigning a variable to the name so it can be called in a non-conflicting way -->      
<c:set var="n"><portlet:namespace/></c:set>
<script src="<rs:resourceURL value="/rs/jquery/1.4.2/jquery-1.4.2.min.js"/>" type="text/javascript"></script>


<script type="text/javascript">
    var ${n} = ${n} || {}; //create a unique variable to assign our namespace too
    ${n}.jQuery = jQuery.noConflict(true); //assign jQuery to this namespace

    /*  runs when the document is finished loading.  This prevents things like the 'div' from being fully created */
    ${n}.jQuery(document).ready(function () { 
        var $ = ${n}.jQuery; //reassign $ for normal use of jQuery
        // handle the 'select number of items to display' so that it shows the current setting.
        /*$("#${n}itemsShown").val("${model.items}");

        // handle 'filter by user role' so that it shows the current setting
		$("#${n}userRoleShown").val("${model.userrole}");

        // handle the 'filter by feedback type' to show the current setting. 
        $("#${n}feedbackTypeShown").val("${model.feedbacktype}");

        // handle the two text boxes associated with filter by date
        $("#${n}datePicker1").val("${ model.startDisplayDate }"); 
    	$("#${n}datePicker2").val("${ model.endDisplayDate }");*/

    });
    
</script>


	<h1><spring:message code="map.test"/></h1>
    
    <portlet:actionURL var="postUrl"></portlet:actionURL>
    <form:form action="${ postUrl }" method="post" modelAttribute="newBuildingData"> 
    
    <table style="padding:0; margin:5px 0px; border:none; width:100%">
  	    <tr>
            <td>
		        <spring:message code="map.admin.input.name"/> 
		        <form:input id="${n}nameBox" path="name"/>
            </td>
            <td>
		        <spring:message code="map.admin.input.address"/> 
		        <form:input id="${n}addressBox" path="address"/>
            </td>
		</tr>
		<tr>
            <td>
		        <spring:message code="map.admin.input.zip"/> 
		        <form:input id="${n}zipBox" path="zip"/>
            </td>
            <td>
		        <spring:message code="map.admin.input.abbreviation"/> 
		        <form:input id="${n}abbreviationBox" path="abbreviation"/>
            </td>
            <td>
		        <spring:message code="map.admin.input.alternatename"/> 
		        <form:input id="${n}alternateNameBox" path="alternateName"/>
            </td>
		</tr>
		<tr>
            <td>
		        <spring:message code="map.admin.input.searchtext"/> 
		        <form:input id="${n}searchTextBox" path="searchText"/>
            </td>
            <td>
		        <spring:message code="map.admin.input.imgurl"/> 
		        <form:input id="${n}imgURLBox" path="imgURL"/>
	        </td>
		<tr>
            <td>
		        <spring:message code="map.admin.input.latitude"/> 
		        <form:input id="${n}latitudeBox" path="latitude"/>
            </td>
            <td>
		        <spring:message code="map.admin.input.longitude"/> 
		        <form:input id="${n}longitudeBox" path="longitude"/>
            </td>
		</tr>
            <button type="submit"><spring:message code="map.admin.input.submit"/></button>
        </tr>
        <tr>
		    <td style="text-align: right" style="white-space: nowrap">
				<spring:message code="map.admin.data.showing"/>
				<span style="font-weight: bold;">${ start + 1 } - 
				   ${ (start + items) > totalItems ? totalItems : start + items }</span> 
				   <spring:message code="map.admin.data.of"/> <span style="font-weight: bold;">${ totalItems }</span>
				<c:if test="${ start > 0 }">
					<a href="<portlet:renderURL><portlet:param name="start" value="${ start - items }"/></portlet:renderURL>">&lt; <spring:message code="map.admin.data.prev"/></a>
				</c:if>
				<c:if test="${ start > 0 and start + items < totalItems }">|</c:if>
				<c:if test="${ start + items < totalItems }">
					<a href="<portlet:renderURL><portlet:param name="start" value="${ start + items }"/></portlet:renderURL>"><spring:message code="map.admin.data.next"/> &gt;</a>
				</c:if>
    		</td>
		</tr>
	</table>
    </form:form>	

	<table class="feedback-list" cellspacing="0">
		<tr>
            <th></th>
            <th><spring:message code="map.admin.rowtitle.name"/></th>
			<th><spring:message code="map.admin.rowtitle.address"/></th>
			<th><spring:message code="map.admin.rowtitle.zip"/></th>
			<th><spring:message code="map.admin.rowtitle.abbreviation"/></th>
			<th><spring:message code="map.admin.rowtitle.searchtext"/></th>
		</tr>
		<c:forEach items="${buildings}" var="building" varStatus="status">
			<tr class="${ status.index % 2 == 0 ? 'main' : 'alt' }">
				<td style="width: 25px; text-align: center; border-bottom: thin solid #999; vertical-align: top" ><img src="<c:url value="/images/${ fn:toLowerCase(building.img) }.png"/>"/></td>
				<td>${ building.name }</td>
				<td>${ building.address }</td>
				<td>${ building.zip }</td>
				<td style="text-transform:capitalize">${ building.abbreviation }</td>
                <td colspan="5">${ building.searchText }</td>
			</tr>
		</c:forEach>
	</table>
