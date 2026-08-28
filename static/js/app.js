// Aegis Personal AI Frontend Application — 2026 Aesthetic Edition

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let state = {
        activeTab: 'chat-tab',
        sessionId: localStorage.getItem('aegis_session_id') || null,
        memories: [],
        profile: {},
        persona: {},
        settings: {},
        selectedCategory: 'all',
        isStreaming: false
    };

    // --- DOM Elements ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Chat Elements
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const btnNewChat = document.getElementById('btn-new-chat');
    const btnToggleSessions = document.getElementById('btn-toggle-sessions');
    const sessionsDrawer = document.getElementById('sessions-drawer');
    const btnCloseSessions = document.getElementById('btn-close-sessions');
    const sessionsList = document.getElementById('sessions-list');
    const currentChatTitle = document.getElementById('current-chat-title');
    const memoryCountBadge = document.getElementById('memory-count-badge');
    const btnQuickMemory = document.getElementById('btn-quick-memory');

    // Sidebar & Persona elements
    const sidebarAiName = document.getElementById('sidebar-ai-name');
    const sidebarPersonaPreset = document.getElementById('sidebar-persona-preset');
    const welcomeUserName = document.getElementById('welcome-user-name');
    const welcomeMemCount = document.getElementById('welcome-mem-count');
    const welcomeTonePreset = document.getElementById('welcome-tone-preset');

    // Memory Vault Elements
    const memoriesGrid = document.getElementById('memories-grid');
    const memorySearchInput = document.getElementById('memory-search-input');
    const filterPills = document.querySelectorAll('.filter-pill');
    const searchMatchCount = document.getElementById('search-match-count');
    const metricTotalMemories = document.getElementById('metric-total-memories');
    const btnOpenAddMemory = document.getElementById('btn-open-add-memory');
    const memoryModal = document.getElementById('memory-modal');
    const btnCloseMemoryModal = document.getElementById('btn-close-memory-modal');
    const btnCancelMemoryModal = document.getElementById('btn-cancel-memory-modal');
    const btnSaveMemoryModal = document.getElementById('btn-save-memory-modal');
    const modalMemoryContent = document.getElementById('modal-memory-content');
    const modalMemoryCategory = document.getElementById('modal-memory-category');
    const modalMemoryImportance = document.getElementById('modal-memory-importance');
    const editMemoryId = document.getElementById('edit-memory-id');
    const memoryModalTitle = document.getElementById('memory-modal-title');
    
    // Retrieval test
    const retrievalQuery = document.getElementById('retrieval-test-query');
    const btnTestRetrieval = document.getElementById('btn-test-retrieval');
    const retrievalResults = document.getElementById('retrieval-test-results');

    // Persona Studio Elements
    const presetCards = document.querySelectorAll('.preset-card');
    const personaAiName = document.getElementById('persona-ai-name');
    const personaUserName = document.getElementById('persona-user-name');
    const sliderWarmth = document.getElementById('slider-warmth');
    const sliderHumor = document.getElementById('slider-humor');
    const sliderDirectness = document.getElementById('slider-directness');
    const sliderFormality = document.getElementById('slider-formality');
    const personaEmojis = document.getElementById('persona-emojis');
    const personaCustomInstructions = document.getElementById('persona-custom-instructions');
    const btnSavePersona = document.getElementById('btn-save-persona');
    const voicePreviewText = document.getElementById('voice-preview-text');

    // Profile Elements
    const profileGrid = document.getElementById('profile-grid');
    const profileHeroName = document.getElementById('profile-hero-name');
    const profileHeroGoals = document.getElementById('profile-hero-goals');
    const profileAvatarInitial = document.getElementById('profile-avatar-initial');
    const btnEditHeroName = document.getElementById('btn-edit-hero-name');
    const btnOpenAddProfile = document.getElementById('btn-open-add-profile');
    const profileModal = document.getElementById('profile-modal');
    const profileModalTitle = document.getElementById('profile-modal-title');
    const btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
    const btnCancelProfileModal = document.getElementById('btn-cancel-profile-modal');
    const btnSaveProfileModal = document.getElementById('btn-save-profile-modal');
    const editProfileOriginalKey = document.getElementById('edit-profile-original-key');
    const modalProfileKey = document.getElementById('modal-profile-key');
    const modalProfileValue = document.getElementById('modal-profile-value');
    const modalProfileCategory = document.getElementById('modal-profile-category');

    // Settings Elements
    const settingProvider = document.getElementById('setting-provider');
    const settingModel = document.getElementById('setting-model');
    const settingGeminiKey = document.getElementById('setting-gemini-key');
    const settingOpenaiKey = document.getElementById('setting-openai-key');
    const geminiKeyStatus = document.getElementById('gemini-key-status');
    const openaiKeyStatus = document.getElementById('openai-key-status');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const btnExportData = document.getElementById('btn-export-data');
    const btnTriggerImport = document.getElementById('btn-trigger-import');
    const fileImportInput = document.getElementById('file-import-input');

    // --- Helper: Toast Notification ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // --- Navigation Tabs ---
    function switchTab(targetTab) {
        navItems.forEach(n => n.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        const activeNav = document.querySelector(`.nav-item[data-tab="${targetTab}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        const activePane = document.getElementById(targetTab);
        if (activePane) activePane.classList.add('active');
        state.activeTab = targetTab;

        if (targetTab === 'memory-tab') loadMemories();
        if (targetTab === 'persona-tab') loadPersona();
        if (targetTab === 'profile-tab') loadProfile();
        if (targetTab === 'settings-tab') loadSettings();
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.getAttribute('data-tab'));
        });
    });

    if (btnQuickMemory) {
        btnQuickMemory.addEventListener('click', () => {
            switchTab('memory-tab');
        });
    }

    // --- Slider Value Sync & Live Voice Preview ---
    function updateLiveVoicePreview() {
        const warmth = parseInt(sliderWarmth.value);
        const humor = parseInt(sliderHumor.value);
        const directness = parseInt(sliderDirectness.value);
        const formality = parseInt(sliderFormality.value);
        const emojis = personaEmojis.checked;
        const name = personaUserName.value.trim() || 'Bhavik';

        let text = "";
        if (formality >= 70) {
            text = `Good day, ${name}. I have reviewed our ongoing objectives. How shall we prioritize our focus today?`;
        } else if (humor >= 70 && warmth >= 70) {
            text = `Hey ${name}! Ready to conquer the universe today, or are we fueling up with another coffee first? ${emojis ? '☕🚀' : ''}`;
        } else if (directness >= 75) {
            text = `Hey ${name}. Let's get straight to it: what are we tackling next?`;
        } else if (warmth >= 75) {
            text = `Hey ${name}! Always great to chat with you. How is your day going? I'm right here whenever you need me. ${emojis ? '✨' : ''}`;
        } else {
            text = `Hey ${name}! Great to see you. How did your coding session go? Ready to dive into your next big milestone?`;
        }

        if (voicePreviewText) {
            voicePreviewText.textContent = `"${text}"`;
        }
    }

    function bindSlider(slider, valEl) {
        slider.addEventListener('input', () => {
            valEl.textContent = `${slider.value}%`;
            updateLiveVoicePreview();
        });
    }
    bindSlider(sliderWarmth, document.getElementById('val-warmth'));
    bindSlider(sliderHumor, document.getElementById('val-humor'));
    bindSlider(sliderDirectness, document.getElementById('val-directness'));
    bindSlider(sliderFormality, document.getElementById('val-formality'));
    personaEmojis.addEventListener('change', updateLiveVoicePreview);
    personaUserName.addEventListener('input', updateLiveVoicePreview);

    // --- Persona Presets Preset Map ---
    const presetDefaults = {
        "Empathetic Companion": { warmth: 85, humor: 50, directness: 50, formality: 25, emojis: true },
        "Tech Mentor": { warmth: 60, humor: 40, directness: 80, formality: 40, emojis: false },
        "Candid Best Friend": { warmth: 80, humor: 85, directness: 80, formality: 10, emojis: true },
        "Executive Assistant": { warmth: 45, humor: 20, directness: 95, formality: 80, emojis: false },
        "Philosopher": { warmth: 70, humor: 35, directness: 40, formality: 60, emojis: false }
    };

    presetCards.forEach(card => {
        card.addEventListener('click', () => {
            presetCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const presetName = card.getAttribute('data-preset');
            const conf = presetDefaults[presetName];
            if (conf) {
                sliderWarmth.value = conf.warmth;
                document.getElementById('val-warmth').textContent = `${conf.warmth}%`;
                sliderHumor.value = conf.humor;
                document.getElementById('val-humor').textContent = `${conf.humor}%`;
                sliderDirectness.value = conf.directness;
                document.getElementById('val-directness').textContent = `${conf.directness}%`;
                sliderFormality.value = conf.formality;
                document.getElementById('val-formality').textContent = `${conf.formality}%`;
                personaEmojis.checked = conf.emojis;
                updateLiveVoicePreview();
            }
        });
    });

    // --- API Calls & Data Loaders ---

    async function loadPersona() {
        try {
            const res = await fetch('/api/persona');
            const data = await res.json();
            state.persona = data.persona;

            personaAiName.value = state.persona.ai_name || 'Aegis';
            personaUserName.value = state.persona.user_name || 'Bhavik';
            sidebarAiName.textContent = state.persona.ai_name || 'Aegis';
            sidebarPersonaPreset.textContent = state.persona.tone_preset || 'Empathetic Companion';
            
            if (welcomeUserName) welcomeUserName.textContent = state.persona.user_name || 'Bhavik';
            if (welcomeTonePreset) welcomeTonePreset.textContent = state.persona.tone_preset || 'Companion';

            sliderWarmth.value = state.persona.warmth ?? 80;
            document.getElementById('val-warmth').textContent = `${sliderWarmth.value}%`;
            sliderHumor.value = state.persona.humor ?? 50;
            document.getElementById('val-humor').textContent = `${sliderHumor.value}%`;
            sliderDirectness.value = state.persona.directness ?? 60;
            document.getElementById('val-directness').textContent = `${sliderDirectness.value}%`;
            sliderFormality.value = state.persona.formality ?? 30;
            document.getElementById('val-formality').textContent = `${sliderFormality.value}%`;
            personaEmojis.checked = state.persona.use_emojis ?? true;
            personaCustomInstructions.value = state.persona.custom_instructions || '';

            presetCards.forEach(card => {
                if (card.getAttribute('data-preset') === state.persona.tone_preset) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            updateLiveVoicePreview();
        } catch (e) {
            console.error('Error loading persona:', e);
        }
    }

    async function savePersona() {
        const activePresetCard = document.querySelector('.preset-card.active');
        const presetName = activePresetCard ? activePresetCard.getAttribute('data-preset') : 'Empathetic Companion';

        const payload = {
            ai_name: personaAiName.value.trim(),
            user_name: personaUserName.value.trim(),
            tone_preset: presetName,
            warmth: parseInt(sliderWarmth.value),
            humor: parseInt(sliderHumor.value),
            directness: parseInt(sliderDirectness.value),
            formality: parseInt(sliderFormality.value),
            use_emojis: personaEmojis.checked,
            custom_instructions: personaCustomInstructions.value.trim()
        };

        try {
            const res = await fetch('/api/persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast('Persona updated successfully!');
                loadPersona();
            }
        } catch (e) {
            showToast('Failed to save persona', 'error');
        }
    }
    btnSavePersona.addEventListener('click', savePersona);

    // --- Memory Vault Operations ---

    async function loadMemories() {
        try {
            let url = `/api/memories?category=${state.selectedCategory}`;
            if (memorySearchInput.value.trim()) {
                url += `&search=${encodeURIComponent(memorySearchInput.value.trim())}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            state.memories = data.memories || [];
            
            const count = data.count || state.memories.length;
            memoryCountBadge.textContent = count;
            if (metricTotalMemories) metricTotalMemories.textContent = count;
            if (welcomeMemCount) welcomeMemCount.textContent = count;
            if (searchMatchCount) searchMatchCount.textContent = `${state.memories.length} item${state.memories.length === 1 ? '' : 's'}`;

            renderMemories();
        } catch (e) {
            console.error('Error loading memories:', e);
        }
    }

    function renderMemories() {
        memoriesGrid.innerHTML = '';
        if (state.memories.length === 0) {
            memoriesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-brain-circuit" style="font-size: 38px; margin-bottom: 14px; opacity: 0.4; color: var(--primary-light);"></i>
                    <h4 style="font-family: var(--font-heading); font-size: 16px; color: #fff; margin-bottom: 6px;">No Memories Found</h4>
                    <p style="font-size: 13px; max-width: 360px; margin: 0 auto;">Start chatting naturally or click "Add New Memory" to seed your personal knowledge vault.</p>
                </div>
            `;
            return;
        }

        state.memories.forEach(mem => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            const cat = mem.category || 'fact';
            const dateStr = mem.created_at ? new Date(mem.created_at).toLocaleDateString() : '';
            const importancePct = Math.round((mem.importance || 0.5) * 100);

            card.innerHTML = `
                <div>
                    <div class="memory-card-header">
                        <span class="cat-badge ${cat}">${cat}</span>
                        <span style="font-size: 11px; color: var(--cyan); font-weight: 600;">
                            <i class="fa-solid fa-gauge-high"></i> ${importancePct}% weight
                        </span>
                    </div>
                    <div class="memory-content" style="margin-top: 12px;">${escapeHtml(mem.content)}</div>
                </div>
                <div class="memory-card-footer">
                    <span>${dateStr ? `<i class="fa-regular fa-calendar"></i> ${dateStr}` : ''}</span>
                    <div class="memory-actions">
                        <button class="icon-btn edit-mem-btn" data-id="${mem.id}" title="Edit Memory"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="icon-btn danger delete-mem-btn" data-id="${mem.id}" title="Forget Memory"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            memoriesGrid.appendChild(card);
        });

        // Bind delete & edit
        document.querySelectorAll('.delete-mem-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want the AI to forget this memory?')) {
                    const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        showToast('Memory forgotten');
                        loadMemories();
                    }
                }
            });
        });

        document.querySelectorAll('.edit-mem-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const memory = state.memories.find(m => m.id === id);
                if (memory) {
                    editMemoryId.value = memory.id;
                    modalMemoryContent.value = memory.content;
                    modalMemoryCategory.value = memory.category || 'fact';
                    modalMemoryImportance.value = memory.importance || 0.8;
                    memoryModalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Memory';
                    memoryModal.classList.remove('hidden');
                }
            });
        });
    }

    // Category filter pills
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.selectedCategory = pill.getAttribute('data-category');
            loadMemories();
        });
    });

    memorySearchInput.addEventListener('input', () => {
        loadMemories();
    });

    // Add / Edit Memory Modal handlers
    btnOpenAddMemory.addEventListener('click', () => {
        editMemoryId.value = '';
        modalMemoryContent.value = '';
        modalMemoryCategory.value = 'preference';
        modalMemoryImportance.value = '0.8';
        memoryModalTitle.innerHTML = '<i class="fa-solid fa-microchip"></i> Add New Memory';
        memoryModal.classList.remove('hidden');
    });

    btnCloseMemoryModal.addEventListener('click', () => memoryModal.classList.add('hidden'));
    btnCancelMemoryModal.addEventListener('click', () => memoryModal.classList.add('hidden'));

    btnSaveMemoryModal.addEventListener('click', async () => {
        const content = modalMemoryContent.value.trim();
        if (!content) {
            alert('Please enter memory content.');
            return;
        }
        const category = modalMemoryCategory.value;
        const importance = parseFloat(modalMemoryImportance.value);
        const id = editMemoryId.value;

        if (id) {
            // Update
            const res = await fetch(`/api/memories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, category, importance })
            });
            if (res.ok) {
                showToast('Memory updated in vault!');
                memoryModal.classList.add('hidden');
                loadMemories();
            }
        } else {
            // Create
            const res = await fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, category, importance })
            });
            if (res.ok) {
                showToast('Memory saved to vault!');
                memoryModal.classList.add('hidden');
                loadMemories();
            }
        }
    });

    // Test Memory Retrieval
    btnTestRetrieval.addEventListener('click', async () => {
        const query = retrievalQuery.value.trim();
        if (!query) return;
        try {
            const res = await fetch(`/api/memories/test-retrieval?query=${encodeURIComponent(query)}`, { method: 'POST' });
            const data = await res.json();
            retrievalResults.classList.remove('hidden');
            if (!data.retrieved || data.retrieved.length === 0) {
                retrievalResults.innerHTML = `<span style="font-size: 12px; color: var(--text-muted);">No matching memories found for this query.</span>`;
            } else {
                let html = `<span style="font-size: 12px; color: var(--cyan); font-weight: 700;"><i class="fa-solid fa-sparkles"></i> Top ${data.retrieved.length} Memories Recalled for Query:</span>`;
                data.retrieved.forEach((m) => {
                    html += `<div style="font-size: 12.5px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; margin-top: 6px; border-left: 3px solid var(--cyan);">
                        <strong>[${m.category.toUpperCase()}]</strong> ${escapeHtml(m.content)}
                    </div>`;
                });
                retrievalResults.innerHTML = html;
            }
        } catch (e) {
            console.error(e);
        }
    });

    // --- Profile & Identity Operations ---

    async function loadProfile() {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            state.profile = data.profile || {};
            
            const nameVal = state.profile.name ? (state.profile.name.value || 'Bhavik') : 'Bhavik';
            const goalsVal = state.profile.primary_goals ? (state.profile.primary_goals.value || 'Building cutting-edge systems') : 'Building AI systems';
            
            if (profileHeroName) profileHeroName.textContent = nameVal;
            if (profileAvatarInitial) profileAvatarInitial.textContent = nameVal.charAt(0).toUpperCase();
            if (profileHeroGoals) profileHeroGoals.innerHTML = `<i class="fa-solid fa-bullseye"></i> ${escapeHtml(goalsVal)}`;

            renderProfile();
        } catch (e) {
            console.error('Error loading profile:', e);
        }
    }

    function renderProfile() {
        profileGrid.innerHTML = '';
        const keys = Object.keys(state.profile);
        if (keys.length === 0) {
            profileGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">No identity fields configured yet.</p>`;
            return;
        }

        keys.forEach(k => {
            const item = state.profile[k];
            const val = typeof item === 'object' ? item.value : item;
            const cat = typeof item === 'object' ? item.category : 'general';

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <h3 style="text-transform: capitalize;"><i class="fa-solid fa-id-card-clip" style="color: var(--primary-light);"></i> ${k.replace(/_/g, ' ')}</h3>
                    <div style="display: flex; gap: 8px;">
                        <button class="icon-btn edit-profile-btn" data-key="${k}" title="Edit Attribute"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="icon-btn danger delete-profile-btn" data-key="${k}" title="Delete Attribute"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <p style="font-size: 15px; color: #fff; font-weight: 500;">${escapeHtml(val)}</p>
                    <span class="cat-badge fact" style="align-self: flex-start;">Category: ${cat}</span>
                </div>
            `;
            profileGrid.appendChild(card);
        });

        // Bind Edit buttons
        document.querySelectorAll('.edit-profile-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const k = btn.getAttribute('data-key');
                const item = state.profile[k];
                const val = typeof item === 'object' ? item.value : item;
                const cat = typeof item === 'object' ? item.category : 'general';

                editProfileOriginalKey.value = k;
                modalProfileKey.value = k;
                modalProfileValue.value = val;
                modalProfileCategory.value = cat;
                profileModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit ${escapeHtml(k.replace(/_/g, ' '))}`;
                profileModal.classList.remove('hidden');
            });
        });

        // Bind Delete buttons
        document.querySelectorAll('.delete-profile-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const k = btn.getAttribute('data-key');
                if (confirm(`Remove profile attribute "${k}"?`)) {
                    const res = await fetch(`/api/profile/${k}`, { method: 'DELETE' });
                    if (res.ok) {
                        showToast('Profile field removed');
                        loadProfile();
                    }
                }
            });
        });
    }

    if (btnEditHeroName) {
        btnEditHeroName.addEventListener('click', () => {
            const currentName = state.profile.name ? (state.profile.name.value || 'Bhavik') : (state.persona.user_name || 'Bhavik');
            editProfileOriginalKey.value = 'name';
            modalProfileKey.value = 'name';
            modalProfileValue.value = currentName;
            modalProfileCategory.value = 'identity';
            profileModalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Your Name';
            profileModal.classList.remove('hidden');
        });
    }

    btnOpenAddProfile.addEventListener('click', () => {
        editProfileOriginalKey.value = '';
        modalProfileKey.value = '';
        modalProfileValue.value = '';
        modalProfileCategory.value = 'general';
        profileModalTitle.innerHTML = '<i class="fa-solid fa-id-card"></i> Add Identity Attribute';
        profileModal.classList.remove('hidden');
    });

    btnCloseProfileModal.addEventListener('click', () => profileModal.classList.add('hidden'));
    btnCancelProfileModal.addEventListener('click', () => profileModal.classList.add('hidden'));

    btnSaveProfileModal.addEventListener('click', async () => {
        const key = modalProfileKey.value.trim().toLowerCase().replace(/\s+/g, '_');
        const value = modalProfileValue.value.trim();
        const category = modalProfileCategory.value;
        const originalKey = editProfileOriginalKey.value;

        if (!key || !value) {
            alert('Please fill out both attribute name and value.');
            return;
        }

        // If renamed key, delete previous key
        if (originalKey && originalKey !== key) {
            await fetch(`/api/profile/${originalKey}`, { method: 'DELETE' });
        }

        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value, category })
        });

        if (res.ok) {
            showToast('Identity attribute updated!');
            profileModal.classList.add('hidden');

            // If name or nickname was changed, sync persona user_name & UI
            if (key === 'name' || key === 'preferred_nickname') {
                if (state.persona) {
                    state.persona.user_name = value;
                    await fetch('/api/persona', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(state.persona)
                    });
                    loadPersona();
                }
            }

            loadProfile();
        }
    });

    // --- Settings & API Configuration ---

    async function loadSettings() {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            state.settings = data;

            settingProvider.value = data.active_provider || 'gemini';
            settingModel.value = data.active_model || 'gemini-3.6-flash';

            if (data.gemini_api_key_set) {
                geminiKeyStatus.textContent = `Configured (${data.gemini_api_key_masked})`;
                geminiKeyStatus.style.color = 'var(--emerald)';
            } else {
                geminiKeyStatus.textContent = 'Not Set';
                geminiKeyStatus.style.color = 'var(--rose)';
            }

            if (data.openai_api_key_set) {
                openaiKeyStatus.textContent = `Configured (${data.openai_api_key_masked})`;
                openaiKeyStatus.style.color = 'var(--emerald)';
            } else {
                openaiKeyStatus.textContent = 'Not Set';
                openaiKeyStatus.style.color = 'var(--rose)';
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }

    btnSaveSettings.addEventListener('click', async () => {
        const payload = {
            active_provider: settingProvider.value,
            active_model: settingModel.value.trim(),
            gemini_api_key: settingGeminiKey.value.trim() || undefined,
            openai_api_key: settingOpenaiKey.value.trim() || undefined
        };

        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Settings & API credentials saved!');
            settingGeminiKey.value = '';
            settingOpenaiKey.value = '';
            loadSettings();
        }
    });

    // Export / Import
    btnExportData.addEventListener('click', async () => {
        const res = await fetch('/api/export');
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aegis_personal_ai_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup file downloaded');
    });

    btnTriggerImport.addEventListener('click', () => fileImportInput.click());
    fileImportInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
            const parsed = JSON.parse(text);
            const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed)
            });
            if (res.ok) {
                const data = await res.json();
                showToast(`Restored successfully (${data.imported_memories_count} memories loaded)!`);
                loadMemories();
                loadProfile();
                loadPersona();
            }
        } catch (err) {
            showToast('Invalid JSON backup file', 'error');
        }
    });

    // --- Chat Logic & Streaming ---

    async function loadSessions() {
        try {
            const res = await fetch('/api/sessions');
            const data = await res.json();
            renderSessionsList(data.sessions || []);
        } catch (e) {
            console.error('Error loading sessions:', e);
        }
    }

    function renderSessionsList(sessions) {
        sessionsList.innerHTML = '';
        if (sessions.length === 0) {
            sessionsList.innerHTML = `<div style="padding: 12px; font-size: 12px; color: var(--text-muted); text-align: center;">No past conversations yet.</div>`;
            return;
        }

        sessions.forEach(s => {
            const item = document.createElement('div');
            item.className = `session-item ${s.id === state.sessionId ? 'active' : ''}`;
            item.innerHTML = `
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 230px;">
                    <i class="fa-regular fa-message"></i> ${escapeHtml(s.title)}
                </span>
                <button class="icon-btn danger delete-session-btn" data-id="${s.id}" title="Delete session">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            item.addEventListener('click', (e) => {
                if (e.target.closest('.delete-session-btn')) return;
                switchSession(s.id, s.title);
                sessionsDrawer.classList.remove('open');
            });
            sessionsList.appendChild(item);
        });

        document.querySelectorAll('.delete-session-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (confirm('Delete this conversation?')) {
                    await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
                    if (state.sessionId === id) startNewChat();
                    loadSessions();
                }
            });
        });
    }

    async function switchSession(sessionId, title) {
        state.sessionId = sessionId;
        localStorage.setItem('aegis_session_id', sessionId);
        currentChatTitle.textContent = title || 'Conversation';
        
        // Fetch session messages
        const res = await fetch(`/api/sessions/${sessionId}/messages`);
        const data = await res.json();
        chatMessages.innerHTML = '';

        if (!data.messages || data.messages.length === 0) {
            showWelcomeCard();
        } else {
            data.messages.forEach(msg => {
                appendMessageToUI(msg.role, msg.content);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function startNewChat() {
        state.sessionId = 'session_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('aegis_session_id', state.sessionId);
        currentChatTitle.textContent = 'New Conversation';
        chatMessages.innerHTML = '';
        showWelcomeCard();
        loadSessions();
    }

    function showWelcomeCard() {
        chatMessages.innerHTML = `
            <div class="welcome-card">
                <div class="welcome-mascot-hero">
                    <img src="/static/images/cartoon_avatar.jpg" alt="Cartoon AI" class="welcome-mascot-img">
                    <div class="floating-sparkle s1"><i class="fa-solid fa-sparkles"></i></div>
                    <div class="floating-sparkle s2"><i class="fa-solid fa-heart"></i></div>
                </div>
                <div class="welcome-tag">Personal Memory Enabled</div>
                <h2 class="welcome-greeting">Hey there, <span class="gradient-text" id="welcome-user-name">${state.persona.user_name || 'Bhavik'}</span>!</h2>
                <p class="welcome-desc">
                    I am your personal companion. Everything you share about your code, projects, food, habits, and ideas stays safely remembered in your vault!
                </p>

                <div class="welcome-stats">
                    <div class="stat-pill">
                        <i class="fa-solid fa-brain"></i>
                        <span>Memories: <strong id="welcome-mem-count">${state.memories.length}</strong></span>
                    </div>
                    <div class="stat-pill">
                        <i class="fa-solid fa-masks-theater"></i>
                        <span>Tone: <strong id="welcome-tone-preset">${state.persona.tone_preset || 'Companion'}</strong></span>
                    </div>
                    <div class="stat-pill">
                        <i class="fa-solid fa-database"></i>
                        <span>Vault: <strong>Local SQLite</strong></span>
                    </div>
                </div>

                <div class="starter-chips">
                    <button class="chip" data-prompt="Let's brainstorm ideas for my current software project.">
                        💡 Brainstorm project ideas
                    </button>
                    <button class="chip" data-prompt="What are my top goals and preferences that you remember?">
                        🧠 What do you know about me?
                    </button>
                    <button class="chip" data-prompt="I have an update on my work and routine to tell you.">
                        📝 Share a new life update
                    </button>
                </div>
            </div>
        `;
        bindStarterChips();
    }

    function bindStarterChips() {
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.getAttribute('data-prompt');
                chatInput.value = prompt;
                handleSendMessage();
            });
        });
    }

    btnNewChat.addEventListener('click', startNewChat);
    btnToggleSessions.addEventListener('click', () => {
        sessionsDrawer.classList.toggle('open');
        if (sessionsDrawer.classList.contains('open')) loadSessions();
    });
    btnCloseSessions.addEventListener('click', () => sessionsDrawer.classList.remove('open'));

    // Handle textarea auto-grow and submit
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSendMessage();
    });

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text || state.isStreaming) return;

        // Clear welcome card if visible
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) welcomeCard.remove();

        if (!state.sessionId) {
            state.sessionId = 'session_' + Math.random().toString(36).substring(2, 12);
            localStorage.setItem('aegis_session_id', state.sessionId);
        }

        // 1. Append User Message
        appendMessageToUI('user', text);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // 2. Prepare Assistant Message Placeholder
        const assistantMsgEl = appendMessageToUI('assistant', '');
        const bubble = assistantMsgEl.querySelector('.message-bubble');

        state.isStreaming = true;
        let accumulatedText = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: state.sessionId,
                    message: text
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop(); // keep partial chunk

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.replace('data: ', '').trim();
                        if (jsonStr) {
                            try {
                                const event = JSON.parse(jsonStr);
                                if (event.type === 'token') {
                                    accumulatedText += event.token;
                                    bubble.innerHTML = renderMarkdown(accumulatedText);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                } else if (event.type === 'done') {
                                    // Finished streaming
                                    setTimeout(loadMemories, 1200);
                                }
                            } catch (err) {
                                console.error('Error parsing SSE event:', err);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            bubble.innerHTML = `<span style="color: var(--rose);">[Connection error: Unable to complete response]</span>`;
        } finally {
            state.isStreaming = false;
            bubble.querySelectorAll('pre code').forEach((el) => {
                hljs.highlightElement(el);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function appendMessageToUI(role, content) {
        const row = document.createElement('div');
        row.className = `message-row ${role}`;
        
        const avatarContent = role === 'user' 
            ? '<i class="fa-solid fa-user"></i>' 
            : '<img src="/static/images/cartoon_avatar.jpg" alt="Aegis Mascot" class="msg-avatar-img">';

        row.innerHTML = `
            <div class="msg-avatar ${role === 'assistant' ? 'assistant-mascot' : ''}">${avatarContent}</div>
            <div class="msg-content-wrapper">
                <div class="message-bubble">${renderMarkdown(content)}</div>
            </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return row;
    }

    function renderMarkdown(text) {
        if (!text) return '';
        if (typeof marked !== 'undefined' && marked.parse) {
            return marked.parse(text);
        }
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- App Init ---
    loadPersona();
    loadMemories();
    loadProfile();
    loadSettings();
    if (state.sessionId) {
        switchSession(state.sessionId, 'Current Session');
    } else {
        startNewChat();
    }
});
