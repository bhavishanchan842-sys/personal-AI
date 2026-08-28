import React, { createContext, useState, useEffect, useContext } from 'react';
import { getServerUrl, setServerUrl, getUserId, setUserId, apiFetch } from '../config/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userId, setUserIdState] = useState('default');
  const [serverUrl, setServerUrlState] = useState('https://viberai.onrender.com');
  const [isConnected, setIsConnected] = useState(false);
  const [persona, setPersona] = useState({
    ai_name: 'Aegis',
    user_name: 'Friend',
    tone_preset: 'Empathetic Companion'
  });
  const [profile, setProfile] = useState({});
  const [memories, setMemories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('session_init');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const uid = await getUserId();
      const sUrl = await getServerUrl();
      setUserIdState(uid);
      setServerUrlState(sUrl);
      await loadAllData(uid);
      setLoading(false);
    };
    init();
  }, []);

  const loadAllData = async (uid = userId, retryCount = 0) => {
    try {
      const res = await apiFetch('/api/persona');
      if (res.ok) {
        const data = await res.json();
        setPersona(data.persona || {});
        setIsConnected(true);
      } else {
        setIsConnected(false);
        if (retryCount < 3) {
          setTimeout(() => loadAllData(uid, retryCount + 1), 2500);
        }
      }
    } catch {
      setIsConnected(false);
      if (retryCount < 3) {
        setTimeout(() => loadAllData(uid, retryCount + 1), 2500);
      }
    }

    try {
      const pRes = await apiFetch('/api/profile');
      if (pRes.ok) {
        const pData = await pRes.json();
        setProfile(pData.profile || {});
      }
    } catch {}

    try {
      const mRes = await apiFetch('/api/memories');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMemories(mData.memories || []);
      }
    } catch {}

    try {
      const uRes = await apiFetch('/api/users');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsersList(uData.users || []);
      }
    } catch {}
  };

  const updateServer = async (newUrl) => {
    const saved = await setServerUrl(newUrl);
    setServerUrlState(saved);
    await loadAllData();
  };

  const switchActiveUser = async (newUid) => {
    await setUserId(newUid);
    setUserIdState(newUid);
    setActiveSessionId('session_' + Math.random().toString(36).substring(2, 10));
    await loadAllData(newUid);
  };

  const addMemoryItem = async (content, category = 'fact', importance = 0.8) => {
    try {
      const res = await apiFetch('/api/memories', {
        method: 'POST',
        body: JSON.stringify({ content, category, importance })
      });
      if (res.ok) {
        await loadAllData();
        return true;
      }
    } catch (e) {
      console.error('Error adding memory:', e);
    }
    return false;
  };

  const deleteMemoryItem = async (id) => {
    try {
      const res = await apiFetch(`/api/memories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadAllData();
        return true;
      }
    } catch (e) {
      console.error('Error deleting memory:', e);
    }
    return false;
  };

  const savePersonaConfig = async (newConfig) => {
    try {
      const res = await apiFetch('/api/persona', {
        method: 'POST',
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setPersona(newConfig);
        return true;
      }
    } catch (e) {
      console.error('Error saving persona:', e);
    }
    return false;
  };

  const saveProfileField = async (key, value, category = 'general') => {
    try {
      const res = await apiFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify({ key, value, category })
      });
      if (res.ok) {
        await loadAllData();
        return true;
      }
    } catch (e) {
      console.error('Error saving profile:', e);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        serverUrl,
        updateServer,
        isConnected,
        persona,
        savePersonaConfig,
        profile,
        saveProfileField,
        memories,
        addMemoryItem,
        deleteMemoryItem,
        sessions,
        activeSessionId,
        setActiveSessionId,
        usersList,
        switchActiveUser,
        refreshData: loadAllData,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
