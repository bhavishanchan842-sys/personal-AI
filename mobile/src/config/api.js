import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_SERVER_URL = '@aegis_server_url';
const STORAGE_KEY_USER_ID = '@aegis_user_id';

// Default production backend URL
const DEFAULT_URL = 'https://viberai.onrender.com';

export const getServerUrl = async () => {
  try {
    const url = await AsyncStorage.getItem(STORAGE_KEY_SERVER_URL);
    // If empty or old local development URL, default to live production URL
    if (!url || url.includes('10.0.2.2') || url.includes('127.0.0.1') || url.includes('localhost')) {
      await AsyncStorage.setItem(STORAGE_KEY_SERVER_URL, DEFAULT_URL);
      return DEFAULT_URL;
    }
    return url;
  } catch {
    return DEFAULT_URL;
  }
};

export const setServerUrl = async (url) => {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    await AsyncStorage.setItem(STORAGE_KEY_SERVER_URL, cleanUrl);
    return cleanUrl;
  } catch (e) {
    console.error('Error saving server URL:', e);
    return DEFAULT_URL;
  }
};

export const getUserId = async () => {
  try {
    let uid = await AsyncStorage.getItem(STORAGE_KEY_USER_ID);
    if (!uid) {
      uid = 'usr_' + Math.random().toString(36).substring(2, 10);
      await AsyncStorage.setItem(STORAGE_KEY_USER_ID, uid);
    }
    return uid;
  } catch {
    return 'default';
  }
};

export const setUserId = async (userId) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_USER_ID, userId);
  } catch (e) {
    console.error('Error saving userId:', e);
  }
};

export const apiFetch = async (path, options = {}) => {
  const baseUrl = await getServerUrl();
  const userId = await getUserId();
  const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return response;
};
