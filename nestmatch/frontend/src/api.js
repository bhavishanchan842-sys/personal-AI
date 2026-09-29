const API_BASE = '/api';

export const api = {
  getToken: () => localStorage.getItem('nestmate_token') || localStorage.getItem('nestmatch_token'),
  setToken: (token) => {
    localStorage.setItem('nestmate_token', token);
    localStorage.setItem('nestmatch_token', token);
  },
  clearToken: () => {
    localStorage.removeItem('nestmate_token');
    localStorage.removeItem('nestmatch_token');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  },

  // Auth
  login: (email, password) =>
    api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data) =>
    api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => api.request('/auth/me'),
  getDemoUsers: () => api.request('/auth/demo-users'),

  // Profile
  getMyProfile: () => api.request('/profile/me'),
  updateMyProfile: (data) =>
    api.request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Matches
  getRecommendations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.request(`/match/recommendations${query ? `?${query}` : ''}`);
  },

  getCandidateDetails: (candidateId) =>
    api.request(`/match/candidate/${candidateId}`),

  // Match Requests
  sendMatchRequest: (receiverId, message) =>
    api.request('/match/requests', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, message }),
    }),

  getMyRequests: () => api.request('/match/requests'),

  updateRequestStatus: (requestId, status) =>
    api.request(`/match/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Listings
  getListings: (filters = {}) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    );
    const query = new URLSearchParams(cleanFilters).toString();
    return api.request(`/listings${query ? `?${query}` : ''}`);
  },

  getListingRoommates: (listingId) =>
    api.request(`/listings/${listingId}/roommates`),

  createListing: (data) =>
    api.request('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Utilities
  calculateFairRent: (totalRent, rooms) =>
    api.request('/tools/fair-rent-split', {
      method: 'POST',
      body: JSON.stringify({ total_rent: totalRent, rooms }),
    }),

  createAgreement: (data) =>
    api.request('/tools/agreements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyAgreements: () => api.request('/tools/agreements'),
};
