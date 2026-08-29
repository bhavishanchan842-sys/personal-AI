import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../config/api';

export default function SettingsScreen() {
  const {
    serverUrl,
    updateServer,
    isConnected,
    userId,
    usersList,
    switchActiveUser,
    refreshData
  } = useApp();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [provider, setProvider] = useState('groq');
  const [model, setModel] = useState('openai/gpt-oss-120b');
  const [groqKey, setGroqKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setInputUrl(serverUrl);
  }, [serverUrl]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setProvider(data.active_provider || 'groq');
          setModel(data.active_model || 'openai/gpt-oss-120b');
        }
      } catch {}
    };
    loadSettings();
  }, []);

  const handleSaveServerUrl = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('Required', 'Please enter a server URL.');
      return;
    }
    await updateServer(inputUrl.trim());
    Alert.alert('Server Updated', 'Backend server URL updated.');
  };

  const handleSaveApiSettings = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({
          active_provider: provider,
          active_model: model.trim(),
          groq_api_key: groqKey.trim() || undefined
        })
      });
      if (res.ok) {
        setGroqKey('');
        Alert.alert('Saved', 'AI Provider and credentials saved!');
      }
    } catch {
      Alert.alert('Error', 'Could not reach server to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewUser = () => {
    const newUid = 'usr_' + Math.random().toString(36).substring(2, 10);
    switchActiveUser(newUid);
    Alert.alert('New User Created', `Switched to clean profile (${newUid}). Configure your name in Persona Studio!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings & Keys</Text>
          <Text style={styles.subtitle}>Configure server connection & multi-user profile</Text>
        </View>

        {/* Server Connection Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Backend Server Connection</Text>
            <View style={[styles.statusPill, { backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)' }]}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#f43f5e' }]} />
              <Text style={[styles.statusPillText, { color: isConnected ? '#10b981' : '#f43f5e' }]}>
                {isConnected ? 'Connected' : 'Offline'}
              </Text>
            </View>
          </View>
          <Text style={styles.hint}>
            Default live server: <Text style={{ color: '#06b6d4', fontWeight: '700' }}>https://viberai.onrender.com</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="https://viberai.onrender.com"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.btnSecondary} onPress={handleSaveServerUrl}>
            <Ionicons name="link" size={16} color="#fff" />
            <Text style={styles.btnSecondaryText}>Connect Server</Text>
          </TouchableOpacity>
        </View>

        {/* User Profiles & Multi-Tenant Switcher */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Active User Profile</Text>
            <TouchableOpacity style={styles.btnSm} onPress={handleCreateNewUser}>
              <Ionicons name="person-add" size={14} color="#06b6d4" />
              <Text style={styles.btnSmText}>+ New User</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Current User ID: <Text style={{ color: '#06b6d4', fontWeight: '700' }}>{userId}</Text>
          </Text>
          
          <View style={styles.usersList}>
            {usersList.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[styles.userItem, u.id === userId && styles.userItemActive]}
                onPress={() => switchActiveUser(u.id)}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitial}>{(u.name || 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{u.name || 'User'}</Text>
                  <Text style={styles.userSub}>Nickname: {u.nickname || u.name}</Text>
                </View>
                {u.id === userId ? (
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>Active</Text>
                  </View>
                ) : (
                  <Text style={styles.switchText}>Switch</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LLM Provider Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Provider & Groq API Key</Text>

          <Text style={styles.inputLabel}>Provider</Text>
          <View style={styles.providerRow}>
            {['groq', 'gemini', 'openai'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.provBtn, provider === p && styles.provBtnActive]}
                onPress={() => {
                  setProvider(p);
                  if (p === 'groq') setModel('openai/gpt-oss-120b');
                  else if (p === 'gemini') setModel('gemini-3.6-flash');
                  else if (p === 'openai') setModel('gpt-4o');
                }}
              >
                <Text style={[styles.provText, provider === p && styles.provTextActive]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Model</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="openai/gpt-oss-120b"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.inputLabel}>Groq API Key (Optional if set on server)</Text>
          <TextInput
            style={styles.input}
            value={groqKey}
            onChangeText={setGroqKey}
            placeholder="gsk_..."
            placeholderTextColor="#64748b"
            secureTextEntry
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveApiSettings} disabled={isSaving}>
            <Ionicons name="save" size={16} color="#fff" />
            <Text style={styles.btnPrimaryText}>{isSaving ? 'Saving...' : 'Save AI Settings'}</Text>
          </TouchableOpacity>
        </View>

        {/* Creator Attribution */}
        <View style={{ alignItems: 'center', paddingVertical: 14 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            ViberAI v1.0.0 • Created with ❤️ by <Text style={{ color: '#06b6d4', fontWeight: '700' }}>Bhavish</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16'
  },
  scroll: {
    padding: 16,
    gap: 14
  },
  header: {
    marginBottom: 4
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff'
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8'
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    gap: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700'
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 10
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  },
  btnSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  btnSmText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '700'
  },
  usersList: {
    gap: 8,
    marginTop: 4
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  userItemActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)'
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff'
  },
  userSub: {
    fontSize: 11,
    color: '#64748b'
  },
  activeTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99
  },
  activeTagText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700'
  },
  switchText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '700'
  },
  providerRow: {
    flexDirection: 'row',
    gap: 8
  },
  provBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  provBtnActive: {
    backgroundColor: '#8b5cf6'
  },
  provText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700'
  },
  provTextActive: {
    color: '#fff'
  }
});
