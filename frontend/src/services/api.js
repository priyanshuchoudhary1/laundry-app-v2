import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.code === 'ECONNABORTED') {
      throw { message: 'Request timed out. Please try again.' };
    }
    if (!error.response) {
      throw { message: 'Unable to connect to the server. Please check your internet connection.' };
    }
    throw error.response?.data || { message: 'An unexpected error occurred' };
  }
);

// User API calls
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/profile/${userId}`, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfileImage = async (userId, formData) => {
  try {
    const response = await api.put(`/users/profile-image/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Payment methods API calls
export const addPaymentMethod = async (userId, paymentData) => {
  try {
    const response = await api.post(`/users/payment-methods/${userId}`, paymentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentMethods = async (userId) => {
  try {
    const response = await api.get(`/users/payment-methods/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePaymentMethod = async (userId, methodId) => {
  try {
    const response = await api.delete(`/users/payment-methods/${userId}/${methodId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const setDefaultPaymentMethod = async (userId, methodId) => {
  try {
    const response = await api.put(`/users/payment-methods/${userId}/${methodId}/default`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Laundry preferences API calls
export const getLaundryPreferences = async (userId) => {
  try {
    const response = await api.get(`/users/preferences/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLaundryPreferences = async (userId, preferencesData) => {
  try {
    const response = await api.put(`/users/preferences/${userId}`, preferencesData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Order API calls
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 