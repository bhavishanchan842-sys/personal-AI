import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function MemoryScreen() {
  const { memories, addMemoryItem, deleteMemoryItem } = useApp();
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('fact');

  const categories = ['all', 'preference', 'work', 'personal', 'habit', 'goal', 'fact'];

  const filteredMemories = memories.filter((m) => {
    const matchCat = selectedCat === 'all' || (m.category || '').toLowerCase() === selectedCat;
    const matchQuery = !searchQuery || (m.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleSaveMemory = async () => {
    if (!newContent.trim()) {
      Alert.alert('Required', 'Please enter memory content.');
      return;
    }
    const success = await addMemoryItem(newContent.trim(), newCategory, 0.8);
    if (success) {
      setNewContent('');
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Memory', 'Are you sure you want to remove this fact from your AI memory vault?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMemoryItem(id) }
    ]);
  };

  const renderMemoryCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{(item.category || 'fact').toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={16} color="#f43f5e" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardContent}>{item.content}</Text>
      <Text style={styles.cardDate}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Memory Vault'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Memory Vault</Text>
          <Text style={styles.subtitle}>{memories.length} persistent facts stored</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your memories..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <View style={styles.catScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pill, selectedCat === item && styles.pillActive]}
              onPress={() => setSelectedCat(item)}
            >
              <Text style={[styles.pillText, selectedCat === item && styles.pillTextActive]}>
                {item.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Memories List */}
      <FlatList
        data={filteredMemories}
        renderItem={renderMemoryCard}
        keyExtractor={(item) => (item.id || Math.random()).toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="brain-outline" size={40} color="#475569" />
            <Text style={styles.emptyText}>No memories found in this category.</Text>
          </View>
        }
      />

      {/* Add Memory Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Memory</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Loves working with React Native & Python AI..."
              placeholderTextColor="#64748b"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.modalCats}>
              {['preference', 'work', 'personal', 'habit', 'goal', 'fact'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalCatBtn, newCategory === cat && styles.modalCatBtnActive]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[styles.modalCatText, newCategory === cat && styles.modalCatTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setIsModalOpen(false)}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveMemory}>
                <Text style={styles.btnPrimaryText}>Save Memory</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13.5
  },
  catScroll: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  pillActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#a78bfa'
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8'
  },
  pillTextActive: {
    color: '#fff'
  },
  list: {
    padding: 16,
    gap: 12
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  catBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  catText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06b6d4'
  },
  cardContent: {
    fontSize: 13.5,
    color: '#f1f5f9',
    lineHeight: 19,
    marginBottom: 8
  },
  cardDate: {
    fontSize: 11,
    color: '#64748b'
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13
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
    padding: 18
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    color: '#fff',
    padding: 12,
    fontSize: 13.5,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6
  },
  modalCats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  modalCatBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  modalCatBtnActive: {
    backgroundColor: '#8b5cf6'
  },
  modalCatText: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'capitalize'
  },
  modalCatTextActive: {
    color: '#fff',
    fontWeight: '700'
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
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
