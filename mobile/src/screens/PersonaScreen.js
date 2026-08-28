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

export default function PersonaScreen() {
  const { persona, savePersonaConfig } = useApp();
  const [aiName, setAiName] = useState(persona.ai_name || 'Aegis');
  const [userName, setUserName] = useState(persona.user_name || 'Bhavik');
  const [preset, setPreset] = useState(persona.tone_preset || 'Empathetic Companion');
  const [warmth, setWarmth] = useState(persona.warmth || 80);
  const [humor, setHumor] = useState(persona.humor || 50);
  const [directness, setDirectness] = useState(persona.directness || 60);
  const [customInstructions, setCustomInstructions] = useState(persona.custom_instructions || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (persona) {
      setAiName(persona.ai_name || 'Aegis');
      setUserName(persona.user_name || 'Bhavik');
      setPreset(persona.tone_preset || 'Empathetic Companion');
      setWarmth(persona.warmth || 80);
      setHumor(persona.humor || 50);
      setDirectness(persona.directness || 60);
      setCustomInstructions(persona.custom_instructions || '');
    }
  }, [persona]);

  const presetsList = [
    { name: 'Empathetic Companion', icon: 'heart', desc: 'Warm, supportive, active listener' },
    { name: 'Tech Mentor', icon: 'code-slash', desc: 'Architectural, precise, pedagogical' },
    { name: 'Candid Best Friend', icon: 'happy', desc: 'Witty banter, direct, authentic' },
    { name: 'Executive Assistant', icon: 'briefcase', desc: 'Outcome-driven, structured, concise' },
    { name: 'Philosopher', icon: 'bulb', desc: 'Deep inquiry, reflective, intellectually curious' }
  ];

  const handleSelectPreset = (pName) => {
    setPreset(pName);
    if (pName === 'Empathetic Companion') {
      setWarmth(85); setHumor(50); setDirectness(50);
    } else if (pName === 'Tech Mentor') {
      setWarmth(60); setHumor(35); setDirectness(85);
    } else if (pName === 'Candid Best Friend') {
      setWarmth(80); setHumor(90); setDirectness(70);
    } else if (pName === 'Executive Assistant') {
      setWarmth(40); setHumor(20); setDirectness(95);
    } else if (pName === 'Philosopher') {
      setWarmth(70); setHumor(40); setDirectness(35);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await savePersonaConfig({
      ...persona,
      ai_name: aiName.trim() || 'Aegis',
      user_name: userName.trim() || 'Friend',
      tone_preset: preset,
      warmth,
      humor,
      directness,
      custom_instructions: customInstructions.trim()
    });
    setIsSaving(false);
    if (success) {
      Alert.alert('Saved', 'Persona voice and Demeanor updated successfully!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Persona Studio</Text>
          <Text style={styles.subtitle}>Fine-tune your AI's voice and personality</Text>
        </View>

        {/* Identity Names */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Names & Identity</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>AI Companion Name</Text>
            <TextInput
              style={styles.input}
              value={aiName}
              onChangeText={setAiName}
              placeholder="Aegis"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Preferred Name</Text>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Bhavik"
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        {/* Archetype Presets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Companion Archetype</Text>
          <View style={styles.presetsGrid}>
            {presetsList.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[styles.presetCard, preset === item.name && styles.presetCardActive]}
                onPress={() => handleSelectPreset(item.name)}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={preset === item.name ? '#06b6d4' : '#94a3b8'}
                />
                <View style={styles.presetMeta}>
                  <Text style={[styles.presetName, preset === item.name && styles.presetNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={styles.presetDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tone Sliders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tone Sliders</Text>
          
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Warmth & Empathy</Text>
            <Text style={styles.sliderVal}>{warmth}%</Text>
          </View>
          <View style={styles.stepperRow}>
            {[20, 50, 80, 95].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.stepBtn, warmth === val && styles.stepBtnActive]}
                onPress={() => setWarmth(val)}
              >
                <Text style={[styles.stepText, warmth === val && styles.stepTextActive]}>{val}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Humor & Wit</Text>
            <Text style={styles.sliderVal}>{humor}%</Text>
          </View>
          <View style={styles.stepperRow}>
            {[10, 40, 70, 90].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.stepBtn, humor === val && styles.stepBtnActive]}
                onPress={() => setHumor(val)}
              >
                <Text style={[styles.stepText, humor === val && styles.stepTextActive]}>{val}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Directness</Text>
            <Text style={styles.sliderVal}>{directness}%</Text>
          </View>
          <View style={styles.stepperRow}>
            {[30, 60, 80, 95].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.stepBtn, directness === val && styles.stepBtnActive]}
                onPress={() => setDirectness(val)}
              >
                <Text style={[styles.stepText, directness === val && styles.stepTextActive]}>{val}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Directives */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Custom Instructions</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. Always keep answers concise and highlight key action items..."
            placeholderTextColor="#64748b"
            value={customInstructions}
            onChangeText={setCustomInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Persona'}</Text>
        </TouchableOpacity>
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4
  },
  inputGroup: {
    gap: 4
  },
  inputLabel: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '600'
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5
  },
  presetsGrid: {
    gap: 8
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  presetCardActive: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.1)'
  },
  presetMeta: {
    flex: 1
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1'
  },
  presetNameActive: {
    color: '#fff'
  },
  presetDesc: {
    fontSize: 11,
    color: '#64748b'
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  sliderLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600'
  },
  sliderVal: {
    fontSize: 12,
    color: '#06b6d4',
    fontWeight: '700'
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  stepBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center'
  },
  stepBtnActive: {
    backgroundColor: '#8b5cf6'
  },
  stepText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700'
  },
  stepTextActive: {
    color: '#fff'
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    color: '#fff',
    padding: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top'
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  }
});
