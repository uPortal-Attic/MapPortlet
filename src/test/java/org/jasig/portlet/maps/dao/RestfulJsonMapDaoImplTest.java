package org.jasig.portlet.maps.dao;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

import java.util.Map;

import org.jasig.portlet.maps.model.xml.MapData;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

public class RestfulJsonMapDaoImplTest {
	private RestfulJsonMapDaoImpl testee;
	private Long lastModifiedDate= 1L;
	private Long newLastModifiedDate=2L;
	private MapData map = new MapData();
	@Mock
	private RestTemplate mockRestTemplate;
	@Mock
	private ResponseEntity<MapData> responseMock;
	@Mock
	private ResponseEntity emptyResponseMock;
	@Mock
	private HttpHeaders mockHeaders;
	@Mock
	private MapDataProcessor mapProcessorMock;
	
	@Before
	public void setUp(){
		initMocks(this);
		testee = new RestfulJsonMapDaoImpl();
		ReflectionTestUtils.setField(testee, "restTemplate", mockRestTemplate);
		ReflectionTestUtils.setField(testee, "mapProcessor", mapProcessorMock);
	}
	
	@Test
	public void testGetMapNullLastModifiedDateGetsFullMapAndSetsLastModifiedDate(){
		setUpMapRequest();
		setUpResponseWithBody();
		setUpHeadersWithLastModifiedDate();
		MapData mapData = testee.getMap("blah");
		assertNotNull(mapData);
		assertTrue(mapData==ReflectionTestUtils.getField(testee, "mapData"));
		assertEquals(lastModifiedDate,ReflectionTestUtils.getField(testee, "lastModifiedDate"));
		verify(mapProcessorMock,times(1)).postProcessData(any(MapData.class));
	}

	@Test
	public void testGetMapWithLastModifiedDateAndNotModifiedReturnsCachedMap(){
		ReflectionTestUtils.setField(testee, "lastModifiedDate", lastModifiedDate);
		MapData cached = new MapData();
		ReflectionTestUtils.setField(testee, "mapData", cached);
		setUpMapRequest();
		setUpStatusCodeRequest();
		setUpResponseWithNotModified();
		MapData mapData = testee.getMap("blah");
		assertTrue(cached==mapData);
		assertMapRequestNotCalled();
		assertEquals(lastModifiedDate,ReflectionTestUtils.getField(testee, "lastModifiedDate"));
		verify(mapProcessorMock,times(0)).postProcessData(any(MapData.class));
	}

	@Test
	public void testGetMapWithLastModifiedDateAndIsModifiedReturnsNewMapAndChangesLastModifiedDate(){
		ReflectionTestUtils.setField(testee, "lastModifiedDate", lastModifiedDate);
		MapData cached = new MapData();
		ReflectionTestUtils.setField(testee, "mapData", cached);
		setUpMapRequest();
		setUpResponseWithBody();
		setUpStatusCodeRequest();
		setUpResponseWithModified();
		setUpHeadersWithNewLastModifiedDate();
		MapData mapData = testee.getMap("blah");
		assertFalse(cached==mapData);
		assertTrue(ReflectionTestUtils.getField(testee, "mapData")==mapData);
		assertEquals(newLastModifiedDate,ReflectionTestUtils.getField(testee, "lastModifiedDate"));
		verify(mapProcessorMock,times(1)).postProcessData(any(MapData.class));
	}
	
	@Test
	public void testGetMapIsPostProcessed(){
		setUpMapRequest();
		setUpResponseWithBody();
		setUpHeadersWithLastModifiedDate();
		testee.getMap("blah");
		verify(mapProcessorMock,times(1)).postProcessData(any(MapData.class));
	}
	
	@Test
	public void testGetVersionReturnsLastModified(){
		ReflectionTestUtils.setField(testee, "lastModifiedDate", lastModifiedDate);
		assertTrue(testee.getVersion().equals(""+lastModifiedDate));
	}
	
	private void setUpResponseWithNotModified() {
		when(responseMock.getStatusCode()).thenReturn(HttpStatus.NOT_MODIFIED);
		when(emptyResponseMock.getStatusCode()).thenReturn(HttpStatus.NOT_MODIFIED);
	}
	
	private void setUpResponseWithModified() {
		when(responseMock.getStatusCode()).thenReturn(HttpStatus.OK);
		when(emptyResponseMock.getStatusCode()).thenReturn(HttpStatus.OK);
	}
	
	private void setUpStatusCodeRequest() {
		when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.GET), any(HttpEntity.class),
				any(Class.class))).thenReturn(emptyResponseMock);
	}
	
	private void setUpResponseWithBody() {
		when(responseMock.getBody()).thenReturn(map);
	}

	private void setUpMapRequest() {
		when(mockRestTemplate.exchange(any(String.class), eq(HttpMethod.GET), any(HttpEntity.class),
				eq(MapData.class), any(Map.class))).thenReturn(responseMock);
		
	}
	
	private void setUpHeadersWithLastModifiedDate() {
		when(responseMock.getHeaders()).thenReturn(mockHeaders);
		when(emptyResponseMock.getHeaders()).thenReturn(mockHeaders);
		when(mockHeaders.getLastModified()).thenReturn(lastModifiedDate);
	}
	
	private void setUpHeadersWithNewLastModifiedDate() {
		when(responseMock.getHeaders()).thenReturn(mockHeaders);
		when(emptyResponseMock.getHeaders()).thenReturn(mockHeaders);
		when(mockHeaders.getLastModified()).thenReturn(newLastModifiedDate);
	}
	
	private void assertMapRequestNotCalled() {
		verify(mockRestTemplate,times(0)).exchange(any(String.class), eq(HttpMethod.GET), any(HttpEntity.class),
				eq(MapData.class), any(Map.class));
		
	}
}
