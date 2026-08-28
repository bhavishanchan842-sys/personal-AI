import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../config/api';

export default function ChatScreen() {
  const { persona, memories, activeSessionId, isConnected } = useApp();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  const starterChips = [
    '💡 Brainstorm ideas for my current project',
    '🧠 What do you remember about my goals?',
    '📝 Let me give you a new life update'
  ];

  const handleSend = async (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text || isSending) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    const tempAssistantId = (Date.now() + 1).toString();
    const assistantMsg = { id: tempAssistantId, role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          session_id: activeSessionId,
          message: text
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body ? res.body.getReader() : null;
      if (reader) {
        // SSE reader
        const decoder = new TextDecoder();
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.replace('data: ', '').trim());
                if (event.type === 'token') {
                  accumulated += event.token;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === tempAssistantId ? { ...m, content: accumulated } : m))
                  );
                }
              } catch {}
            }
          }
        }
      } else {
        // Fallback text response
        const textData = await res.text();
        // Parse SSE lines
        let accumulated = '';
        const lines = textData.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.replace('data: ', '').trim());
              if (event.type === 'token') {
                accumulated += event.token;
              }
            } catch {}
          }
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === tempAssistantId ? { ...m, content: accumulated || 'Response received.' } : m))
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAssistantId
            ? { ...m, content: `[Connection error: Unable to reach AI companion server. Please check Settings & backend URL.]` }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const renderWelcome = () => (
    <View style={styles.welcomeCard}>
      <View style={styles.mascotCircle}>
        <Ionicons name="sparkles" size={28} color="#06b6d4" />
      </View>
      <Text style={styles.welcomeTag}>Personal Memory Vault Active</Text>
      <Text style={styles.welcomeTitle}>
        Hey, <Text style={styles.accentText}>{persona.user_name || 'Friend'}</Text>!
      </Text>
      <Text style={styles.welcomeDesc}>
        I'm {persona.ai_name || 'Aegis'}, your personal AI companion. Everything you share is saved to your private memory vault!
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Ionicons name="hardware-chip-outline" size={14} color="#8b5cf6" />
          <Text style={styles.statText}>Memories: {memories.length}</Text>
        </View>
        <View style={styles.statPill}>
          <Ionicons name="happy-outline" size={14} color="#06b6d4" />
          <Text style={styles.statText}>{persona.tone_preset || 'Companion'}</Text>
        </View>
      </View>

      <View style={styles.chipsContainer}>
        {starterChips.map((chip, idx) => (
          <TouchableOpacity key={idx} style={styles.chip} onPress={() => handleSend(chip)}>
            <Text style={styles.chipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
        {!isUser && (
          <View style={styles.avatarMini}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAssistant]}>
            {item.content || (isSending && !isUser ? 'Thinking...' : '')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.headerAvatar}>
            <Ionicons name="planet" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{persona.ai_name || 'AEGIS'} AI</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#f43f5e' }]} />
              <Text style={styles.statusText}>{isConnected ? 'Vault Connected' : 'Offline / Check Settings'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setMessages([])}>
          <Ionicons name="add" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderWelcome}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Capsule */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={`Message ${persona.ai_name || 'Aegis'}...`}
            placeholderTextColor="#64748b"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)'
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 11,
    color: '#94a3b8'
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    padding: 16,
    flexGrow: 1
  },
  welcomeCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    alignItems: 'center',
    marginTop: 10
  },
  mascotCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  welcomeTag: {
    fontSize: 11,
    color: '#06b6d4',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6
  },
  accentText: {
    color: '#a78bfa'
  },
  welcomeDesc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  statText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600'
  },
  chipsContainer: {
    width: '100%',
    gap: 8
  },
  chip: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12
  },
  chipText: {
    fontSize: 12.5,
    color: '#e2e8f0'
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8
  },
  msgRowUser: {
    justifyContent: 'flex-end'
  },
  msgRowAssistant: {
    justifyContent: 'flex-start'
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16
  },
  bubbleUser: {
    backgroundColor: '#8b5cf6',
    borderTopRightRadius: 2
  },
  bubbleAssistant: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20
  },
  msgTextUser: {
    color: '#fff'
  },
  msgTextAssistant: {
    color: '#e2e8f0'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 90,
    fontSize: 14
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  sendBtnDisabled: {
    opacity: 0.4
  }
});
