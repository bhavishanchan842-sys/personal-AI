import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const { profile, persona, saveProfileField } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');
  const [attrCategory, setAttrCategory] = useState('identity');

  const currentName = profile.name ? profile.name.value : persona.user_name || 'Bhavik';
  const currentGoals = profile.primary_goals ? profile.primary_goals.value : 'Building cutting-edge AI systems';

  const handleSaveAttribute = async () => {
    if (!attrKey.trim() || !attrVal.trim()) {
      Alert.alert('Required', 'Please fill in both key and value.');
      return;
    }
    const cleanKey = attrKey.trim().toLowerCase().replace(/\s+/g, '_');
    const success = await saveProfileField(cleanKey, attrVal.trim(), attrCategory);
    if (success) {
      setAttrKey('');
      setAttrVal('');
      setIsModalOpen(false);
    }
  };

  const keys = Object.keys(profile);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>User Identity</Text>
          <Text style={styles.subtitle}>Core attributes your companion remembers about you</Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarInitial}>{currentName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.heroMeta}>
            <Text style={styles.heroName}>{currentName}</Text>
            <Text style={styles.heroGoals}>🎯 {currentGoals}</Text>
          </View>
          <TouchableOpacity
            style={styles.heroEditBtn}
            onPress={() => {
              setAttrKey('name');
              setAttrVal(currentName);
              setAttrCategory('identity');
              setIsModalOpen(true);
            }}
          >
            <Ionicons name="pencil" size={16} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        {/* Action Add Button */}
        <TouchableOpacity style={styles.addAttrBtn} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.addAttrBtnText}>Add Identity Trait</Text>
        </TouchableOpacity>

        {/* Attributes List */}
        <View style={styles.traitsList}>
          {keys.map((k) => {
            const item = profile[k];
            const val = typeof item === 'object' ? item.value : item;
            const cat = typeof item === 'object' ? item.category : 'general';

            return (
              <View key={k} style={styles.traitCard}>
                <View style={styles.traitHeader}>
                  <Text style={styles.traitKey}>{k.replace(/_/g, ' ').toUpperCase()}</Text>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{cat}</Text>
                  </View>
                </View>
                <Text style={styles.traitVal}>{val}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit / Add Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Profile Attribute</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Attribute Name (e.g. Favorite Food, Coding Style)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. favorite_framework"
              placeholderTextColor="#64748b"
              value={attrKey}
              onChangeText={setAttrKey}
            />

            <Text style={styles.label}>Value / Details</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. React Native & PyTorch"
              placeholderTextColor="#64748b"
              value={attrVal}
              onChangeText={setAttrVal}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setIsModalOpen(false)}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveAttribute}>
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    gap: 12
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800'
  },
  heroMeta: {
    flex: 1
  },
  heroName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  heroGoals: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  heroEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addAttrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 12
  },
  addAttrBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  },
  traitsList: {
    gap: 10
  },
  traitCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  traitKey: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 0.5
  },
  catBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  catBadgeText: {
    fontSize: 9.5,
    color: '#94a3b8'
  },
  traitVal: {
    fontSize: 13.5,
    color: '#f1f5f9',
    lineHeight: 18
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 16
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    gap: 10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8'
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6
  },
  btnGhost: {
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  btnGhostText: {
    color: '#94a3b8',
    fontSize: 13
  },
  btnPrimary: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  }
});
