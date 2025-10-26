/**
 * Simple API test utilities for development
 * Run this in browser console to test API connections
 */

import { weatherService, contextualRecommendationService, recommendationService, addressService } from '@/services/apiService';
import { authService } from '@/services/authService';

// Test weather service
export const testWeatherService = async () => {
  console.log('🌤️  Testing Weather Service...');
  
  try {
    const seoulCoords = { lat: 37.5665, lon: 126.9780 };
    
    console.log('Testing current weather...');
    const weatherResponse = await weatherService.getCurrentWeather(seoulCoords.lat, seoulCoords.lon);
    console.log('Weather response:', weatherResponse);
    
    console.log('Testing weather context...');
    const contextResponse = await weatherService.getWeatherContext(seoulCoords.lat, seoulCoords.lon);
    console.log('Weather context response:', contextResponse);
    
    console.log('✅ Weather service tests completed');
    return { weather: weatherResponse, context: contextResponse };
  } catch (error) {
    console.error('❌ Weather service test failed:', error);
    throw error;
  }
};

// Test contextual recommendations
export const testContextualRecommendations = async () => {
  console.log('🎯 Testing Contextual Recommendations...');
  
  try {
    const seoulCoords = { lat: 37.5665, lon: 126.9780 };
    const testQuery = '비 오는 날 따뜻한 카페';
    
    console.log(`Testing contextual search: "${testQuery}"`);
    const response = await contextualRecommendationService.getContextualRecommendations(
      testQuery,
      seoulCoords.lat,
      seoulCoords.lon,
      { limit: 5 }
    );
    console.log('Contextual recommendations response:', response);
    
    console.log('✅ Contextual recommendations test completed');
    return response;
  } catch (error) {
    console.error('❌ Contextual recommendations test failed:', error);
    throw error;
  }
};

// Test search functionality
export const testPlaceSearch = async () => {
  console.log('🔍 Testing Place Search...');
  
  try {
    const seoulCoords = { lat: 37.5665, lon: 126.9780 };
    const keywords = ['카페', '조용한'];
    
    console.log(`Testing place search: ${keywords.join(', ')}`);
    const response = await contextualRecommendationService.searchPlaces(
      keywords,
      seoulCoords.lat,
      seoulCoords.lon,
      { limit: 5 }
    );
    console.log('Place search response:', response);
    
    console.log('✅ Place search test completed');
    return response;
  } catch (error) {
    console.error('❌ Place search test failed:', error);
    throw error;
  }
};

// Test personalized recommendations (requires auth)
export const testPersonalizedRecommendations = async () => {
  console.log('👤 Testing Personalized Recommendations...');
  
  try {
    const user = authService.getCurrentUser();
    if (!user || user.isGuest) {
      console.log('⚠️  No authenticated user found, skipping personalized recommendations test');
      return null;
    }
    
    console.log(`Testing personalized recommendations for user: ${user.id}`);
    const response = await recommendationService.getPersonalizedRecommendations(
      user.id,
      { limit: 5, includeBookmarked: false }
    );
    console.log('Personalized recommendations response:', response);
    
    console.log('✅ Personalized recommendations test completed');
    return response;
  } catch (error) {
    console.error('❌ Personalized recommendations test failed:', error);
    throw error;
  }
};

// Test authentication status
export const testAuthStatus = () => {
  console.log('🔐 Testing Authentication Status...');
  
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const token = authService.getToken();
  
  console.log('Is authenticated:', isAuthenticated);
  console.log('Current user:', user);
  console.log('Has token:', !!token);
  
  if (user?.isGuest) {
    console.log('📝 User is in guest mode');
  }
  
  console.log('✅ Authentication status check completed');
  return { isAuthenticated, user, hasToken: !!token };
};

// Test address service
export const testAddressService = async () => {
  console.log('🗺️  Testing Address Service...');
  
  try {
    const seoulCoords = { lat: 37.5665, lon: 126.9780 };
    
    console.log('Testing address resolution...');
    const response = await addressService.reverseGeocode(seoulCoords.lat, seoulCoords.lon);
    console.log('Address response:', response);
    
    console.log('✅ Address service test completed');
    return response;
  } catch (error) {
    console.error('❌ Address service test failed:', error);
    throw error;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Running All API Tests...\n');
  
  const results = {};
  
  try {
    // Test auth status first
    results.auth = testAuthStatus();
    console.log('\n');
    
    // Test backend connection
    results.backend = await testBackendConnection();
    console.log('\n');
    
    // Test address service
    results.address = await testAddressService();
    console.log('\n');
    
    // Test weather service
    results.weather = await testWeatherService();
    console.log('\n');
    
    // Test contextual recommendations
    results.contextual = await testContextualRecommendations();
    console.log('\n');
    
    // Test place search
    results.search = await testPlaceSearch();
    console.log('\n');
    
    // Test personalized recommendations if authenticated
    results.personalized = await testPersonalizedRecommendations();
    console.log('\n');
    
    console.log('🎉 All API tests completed successfully!');
    console.log('Test results:', results);
    
    return results;
  } catch (error) {
    console.error('💥 API tests failed:', error);
    throw error;
  }
};

// Helper to test connection to backend
export const testBackendConnection = async () => {
  console.log('🔗 Testing Backend Connection...');
  
  try {
ㅔㅐ    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    console.log('Backend URL:', baseUrl);
    
    // Test health endpoint (if available)
    const response = await fetch(`${baseUrl}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is responsive');
      console.log('Health check response:', data);
      return { status: 'connected', data };
    } else {
      console.log(`⚠️  Backend responded with status: ${response.status}`);
      return { status: 'error', statusCode: response.status };
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { status: 'failed', error: error.message };
  }
};

// Expose to window for easy testing in browser console
if (typeof window !== 'undefined') {
  window.apiTest = {
    testWeatherService,
    testContextualRecommendations,
    testPlaceSearch,
    testPersonalizedRecommendations,
    testAddressService,
    testAuthStatus,
    testBackendConnection,
    runAllTests
  };
  
  console.log('🧪 API test utilities loaded. Use window.apiTest.runAllTests() to test all APIs');
}