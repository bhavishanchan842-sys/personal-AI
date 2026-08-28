// Register Service Worker for Mobile PWA Installation
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js').catch(err => console.log('SW registration note:', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let state = {
        userId: localStorage.getItem('aegis_user_id') || ('usr_' + Math.random().toString(36).substring(2, 10)),
        activeTab: 'chat-tab',
        sessionId: localStorage.getItem('aegis_session_id') || null,
        memories: [],
        profile: {},
        persona: {},
        settings: {},
        users: [],
        selectedCategory: 'all',
        isStreaming: false
    };

    // Save active userId
    localStorage.setItem('aegis_user_id', state.userId);

    // --- Helper: Centralized API Fetch with User-Id Header ---
    async function apiFetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'X-User-Id': state.userId,
            ...(options.headers || {})
        };
        return fetch(url, { ...options, headers });
    }

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
    const settingGroqKey = document.getElementById('setting-groq-key');
    const settingOpenaiKey = document.getElementById('setting-openai-key');
    const geminiKeyStatus = document.getElementById('gemini-key-status');
    const groqKeyStatus = document.getElementById('groq-key-status');
    const openaiKeyStatus = document.getElementById('openai-key-status');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const btnExportData = document.getElementById('btn-export-data');
    const btnTriggerImport = document.getElementById('btn-trigger-import');
    const fileImportInput = document.getElementById('file-import-input');

    // Onboarding Elements
    const onboardingModal = document.getElementById('onboarding-modal');
    const onboardingForm = document.getElementById('onboarding-form');
    const onboardName = document.getElementById('onboard-name');
    const onboardNickname = document.getElementById('onboard-nickname');
    const onboardOccupation = document.getElementById('onboard-occupation');
    const onboardGoals = document.getElementById('onboard-goals');
    const onboardPreferences = document.getElementById('onboard-preferences');
    const onboardTone = document.getElementById('onboard-tone');
    const btnSkipOnboarding = document.getElementById('btn-skip-onboarding');
    const btnSwitchUser = document.getElementById('btn-switch-user');

    // User Switch Modal Elements
    const userSwitchModal = document.getElementById('user-switch-modal');
    const usersProfileList = document.getElementById('users-profile-list');
    const btnCloseSwitchModal = document.getElementById('btn-close-switch-modal');
    const btnCancelSwitchModal = document.getElementById('btn-cancel-switch-modal');
    const btnCreateNewUserProfile = document.getElementById('btn-create-new-user-profile');

    // Mobile Navigation Elements
    const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const appSidebar = document.getElementById('app-sidebar');
    const btnMobileNewChat = document.getElementById('btn-mobile-new-chat');

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
        state.activeTab = targetTab;
        
        // Desktop nav
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === targetTab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Mobile bottom nav
        mobileNavBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === targetTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        tabPanes.forEach(pane => {
            if (pane.id === targetTab) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        // Close mobile sidebar if open
        if (appSidebar) appSidebar.classList.remove('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');

        if (targetTab === 'memory-tab') loadMemories();
        if (targetTab === 'profile-tab') loadProfile();
        if (targetTab === 'persona-tab') loadPersona();
        if (targetTab === 'settings-tab') loadSettings();
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-tab');
            switchTab(target);
        });
    });

    mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            switchTab(target);
        });
    });

    // Mobile Sidebar Drawer Toggle
    if (btnMobileMenu && appSidebar) {
        btnMobileMenu.addEventListener('click', () => {
            appSidebar.classList.add('open');
            if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
        });
    }

    if (btnCloseSidebar && appSidebar) {
        btnCloseSidebar.addEventListener('click', () => {
            appSidebar.classList.remove('open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        });
    }

    if (sidebarBackdrop && appSidebar) {
        sidebarBackdrop.addEventListener('click', () => {
            appSidebar.classList.remove('open');
            sidebarBackdrop.classList.remove('active');
        });
    }

    if (btnMobileNewChat) {
        btnMobileNewChat.addEventListener('click', () => {
            switchTab('chat-tab');
            startNewChat();
        });
    }

    // --- Memory Vault Operations ---

    async function loadMemories() {
        try {
            const res = await apiFetch(`/api/memories?category=${state.selectedCategory}`);
            const data = await res.json();
            state.memories = data.memories || [];
            
            if (memoryCountBadge) memoryCountBadge.textContent = state.memories.length;
            if (metricTotalMemories) metricTotalMemories.textContent = state.memories.length;
            if (welcomeMemCount) welcomeMemCount.textContent = state.memories.length;

            renderMemories(state.memories);
        } catch (e) {
            console.error('Error loading memories:', e);
        }
    }

    function renderMemories(memories) {
        memoriesGrid.innerHTML = '';
        if (memories.length === 0) {
            memoriesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
                    <i class="fa-solid fa-brain" style="font-size: 36px; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p style="font-size: 15px;">No memories stored yet in this category.</p>
                    <p style="font-size: 13px;">Chat with your AI companion or click "Add Memory" to store facts.</p>
                </div>
            `;
            return;
        }

        memories.forEach(mem => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            
            const cat = (mem.category || 'fact').toLowerCase();
            const dateStr = mem.created_at ? new Date(mem.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const importancePct = Math.round((mem.importance || 0.5) * 100);

            card.innerHTML = `
                <div class="memory-card-header">
                    <span class="cat-badge ${cat}">${cat}</span>
                    <span style="font-size: 11px; color: var(--text-dim); font-weight: 600;">⭐ ${importancePct}%</span>
                </div>
                <div class="memory-content">${escapeHtml(mem.content)}</div>
                <div class="memory-card-footer">
                    <span><i class="fa-regular fa-clock"></i> ${dateStr}</span>
                    <div class="memory-actions">
                        <button class="icon-btn edit-mem-btn" data-id="${mem.id}" title="Edit Memory"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="icon-btn danger delete-mem-btn" data-id="${mem.id}" title="Delete Memory"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            memoriesGrid.appendChild(card);
        });

        // Bind Edit & Delete
        document.querySelectorAll('.edit-mem-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const mem = state.memories.find(m => m.id === id);
                if (mem) {
                    editMemoryId.value = mem.id;
                    modalMemoryContent.value = mem.content;
                    modalMemoryCategory.value = mem.category || 'fact';
                    modalMemoryImportance.value = mem.importance || 0.8;
                    memoryModalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Memory Fact';
                    memoryModal.classList.remove('hidden');
                }
            });
        });

        document.querySelectorAll('.delete-mem-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Delete this memory from your AI companion vault?')) {
                    const res = await apiFetch(`/api/memories/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        showToast('Memory successfully deleted');
                        loadMemories();
                    }
                }
            });
        });
    }

    // Memory Search & Filter
    if (memorySearchInput) {
        memorySearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                renderMemories(state.memories);
                if (searchMatchCount) searchMatchCount.textContent = '';
                return;
            }
            const filtered = state.memories.filter(m => 
                m.content.toLowerCase().includes(query) || 
                (m.category && m.category.toLowerCase().includes(query))
            );
            renderMemories(filtered);
            if (searchMatchCount) searchMatchCount.textContent = `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`;
        });
    }

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.selectedCategory = pill.getAttribute('data-category');
            loadMemories();
        });
    });

    // Add / Edit Memory Modal Handlers
    function openNewMemoryModal() {
        editMemoryId.value = '';
        modalMemoryContent.value = '';
        modalMemoryCategory.value = 'fact';
        modalMemoryImportance.value = '0.8';
        memoryModalTitle.innerHTML = '<i class="fa-solid fa-brain"></i> Add New Memory';
        memoryModal.classList.remove('hidden');
    }

    if (btnOpenAddMemory) btnOpenAddMemory.addEventListener('click', openNewMemoryModal);
    if (btnQuickMemory) btnQuickMemory.addEventListener('click', openNewMemoryModal);

    if (btnCloseMemoryModal) btnCloseMemoryModal.addEventListener('click', () => memoryModal.classList.add('hidden'));
    if (btnCancelMemoryModal) btnCancelMemoryModal.addEventListener('click', () => memoryModal.classList.add('hidden'));

    if (btnSaveMemoryModal) {
        btnSaveMemoryModal.addEventListener('click', async () => {
            const content = modalMemoryContent.value.trim();
            const category = modalMemoryCategory.value;
            const importance = parseFloat(modalMemoryImportance.value) || 0.8;
            const id = editMemoryId.value;

            if (!content) {
                alert('Please enter the memory text.');
                return;
            }

            if (id) {
                // Update
                const res = await apiFetch(`/api/memories/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ content, category, importance })
                });
                if (res.ok) {
                    showToast('Memory updated');
                    memoryModal.classList.add('hidden');
                    loadMemories();
                }
            } else {
                // Create
                const res = await apiFetch('/api/memories', {
                    method: 'POST',
                    body: JSON.stringify({ content, category, importance })
                });
                if (res.ok) {
                    showToast('New memory saved to AI brain');
                    memoryModal.classList.add('hidden');
                    loadMemories();
                }
            }
        });
    }

    // Neural Retrieval Interactive Tester
    if (btnTestRetrieval) {
        btnTestRetrieval.addEventListener('click', async () => {
            const query = retrievalQuery.value.trim();
            if (!query) return;

            retrievalResults.classList.remove('hidden');
            retrievalResults.innerHTML = '<span style="color: var(--cyan); font-size: 13px;"><i class="fa-solid fa-spinner fa-spin"></i> Scoring semantic embeddings & keywords...</span>';

            const res = await apiFetch('/api/memories/test-retrieval', {
                method: 'POST',
                body: JSON.stringify({ query })
            });
            const data = await res.json();
            
            if (!data.retrieved || data.retrieved.length === 0) {
                retrievalResults.innerHTML = '<span style="color: var(--text-dim); font-size: 13px;">No memory triggered above retrieval threshold.</span>';
                return;
            }

            let html = '<div style="display: flex; flex-direction: column; gap: 6px;">';
            data.retrieved.forEach((m, idx) => {
                html += `
                    <div style="background: var(--bg-surface); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 13px;">
                        <span style="color: var(--cyan); font-weight: 700;">#${idx + 1} [${m.category.toUpperCase()}]:</span> ${escapeHtml(m.content)}
                    </div>
                `;
            });
            html += '</div>';
            retrievalResults.innerHTML = html;
        });
    }

    // --- Persona Studio & Tone Tuning ---

    async function loadPersona() {
        try {
            const res = await apiFetch('/api/persona');
            const data = await res.json();
            state.persona = data.persona || {};

            personaAiName.value = state.persona.ai_name || 'Aegis';
            personaUserName.value = state.persona.user_name || 'Bhavik';
            sliderWarmth.value = state.persona.warmth || 80;
            sliderHumor.value = state.persona.humor || 50;
            sliderDirectness.value = state.persona.directness || 60;
            sliderFormality.value = state.persona.formality || 30;
            personaEmojis.checked = state.persona.use_emojis !== false;
            personaCustomInstructions.value = state.persona.custom_instructions || '';

            // Update UI widgets
            if (sidebarAiName) sidebarAiName.textContent = state.persona.ai_name || 'Aegis';
            if (sidebarPersonaPreset) sidebarPersonaPreset.textContent = state.persona.tone_preset || 'Empathetic Companion';
            if (welcomeUserName) welcomeUserName.textContent = state.persona.user_name || 'Bhavik';
            if (welcomeTonePreset) welcomeTonePreset.textContent = state.persona.tone_preset || 'Empathetic Companion';

            document.getElementById('val-warmth').textContent = `${sliderWarmth.value}%`;
            document.getElementById('val-humor').textContent = `${sliderHumor.value}%`;
            document.getElementById('val-directness').textContent = `${sliderDirectness.value}%`;
            document.getElementById('val-formality').textContent = `${sliderFormality.value}%`;

            // Active Preset Card highlight
            presetCards.forEach(card => {
                if (card.getAttribute('data-preset') === state.persona.tone_preset) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            updateVoicePreview();
        } catch (e) {
            console.error('Error loading persona:', e);
        }
    }

    function updateVoicePreview() {
        const name = personaUserName.value.trim() || 'Bhavik';
        const warmth = parseInt(sliderWarmth.value);
        const directness = parseInt(sliderDirectness.value);
        const emojis = personaEmojis.checked;

        let sample = '';
        if (directness >= 75) {
            sample = `"Ready when you are, ${name}. Let's execute your top goals efficiently today."`;
        } else if (warmth >= 70) {
            sample = `"Hey ${name}! ${emojis ? '✨' : ''} Great to see you. How did your work go today? I'm always right here in your corner!"`;
        } else {
            sample = `"Hello ${name}. Ready to assist with your active projects and code architecture."`;
        }
        if (voicePreviewText) voicePreviewText.textContent = sample;
    }

    [sliderWarmth, sliderHumor, sliderDirectness, sliderFormality].forEach(slider => {
        slider.addEventListener('input', () => {
            const id = slider.id.replace('slider-', 'val-');
            const label = document.getElementById(id);
            if (label) label.textContent = `${slider.value}%`;
            updateVoicePreview();
        });
    });

    personaUserName.addEventListener('input', updateVoicePreview);
    personaEmojis.addEventListener('change', updateVoicePreview);

    presetCards.forEach(card => {
        card.addEventListener('click', () => {
            presetCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const preset = card.getAttribute('data-preset');
            
            // Adjust slider presets
            if (preset === 'Empathetic Companion') {
                sliderWarmth.value = 85; sliderHumor.value = 50; sliderDirectness.value = 50; sliderFormality.value = 25;
            } else if (preset === 'Tech Mentor') {
                sliderWarmth.value = 60; sliderHumor.value = 35; sliderDirectness.value = 80; sliderFormality.value = 40;
            } else if (preset === 'Candid Best Friend') {
                sliderWarmth.value = 80; sliderHumor.value = 90; sliderDirectness.value = 70; sliderFormality.value = 10;
            } else if (preset === 'Executive Assistant') {
                sliderWarmth.value = 40; sliderHumor.value = 20; sliderDirectness.value = 95; sliderFormality.value = 80;
            } else if (preset === 'Philosopher') {
                sliderWarmth.value = 70; sliderHumor.value = 40; sliderDirectness.value = 35; sliderFormality.value = 60;
            }

            document.getElementById('val-warmth').textContent = `${sliderWarmth.value}%`;
            document.getElementById('val-humor').textContent = `${sliderHumor.value}%`;
            document.getElementById('val-directness').textContent = `${sliderDirectness.value}%`;
            document.getElementById('val-formality').textContent = `${sliderFormality.value}%`;
            updateVoicePreview();
        });
    });

    btnSavePersona.addEventListener('click', async () => {
        const activeCard = document.querySelector('.preset-card.active');
        const preset = activeCard ? activeCard.getAttribute('data-preset') : 'Empathetic Companion';

        const payload = {
            ai_name: personaAiName.value.trim() || 'Aegis',
            user_name: personaUserName.value.trim() || 'Bhavik',
            tone_preset: preset,
            warmth: parseInt(sliderWarmth.value),
            humor: parseInt(sliderHumor.value),
            directness: parseInt(sliderDirectness.value),
            formality: parseInt(sliderFormality.value),
            use_emojis: personaEmojis.checked,
            custom_instructions: personaCustomInstructions.value.trim()
        };

        const res = await apiFetch('/api/persona', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Persona demeanor & tone saved!');
            loadPersona();
        }
    });

    // --- User Identity Profile Operations ---

    async function loadProfile() {
        try {
            const res = await apiFetch('/api/profile');
            const data = await res.json();
            state.profile = data.profile || {};
            
            const nameVal = state.profile.name ? (state.profile.name.value || 'Bhavik') : (state.persona.user_name || 'Bhavik');
            const goalsVal = state.profile.primary_goals ? (state.profile.primary_goals.value || 'Building cutting-edge AI systems') : 'Building AI systems';
            
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
                    const res = await apiFetch(`/api/profile/${k}`, { method: 'DELETE' });
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
            await apiFetch(`/api/profile/${originalKey}`, { method: 'DELETE' });
        }

        const res = await apiFetch('/api/profile', {
            method: 'POST',
            body: JSON.stringify({ key, value, category })
        });

        if (res.ok) {
            showToast('Identity attribute updated!');
            profileModal.classList.add('hidden');

            // If name or nickname was changed, sync persona user_name & UI
            if (key === 'name' || key === 'preferred_nickname') {
                if (state.persona) {
                    state.persona.user_name = value;
                    await apiFetch('/api/persona', {
                        method: 'POST',
                        body: JSON.stringify(state.persona)
                    });
                    loadPersona();
                }
            }

            loadProfile();
        }
    });

    // --- Settings & API Configuration (Global) ---

    async function loadSettings() {
        try {
            const res = await apiFetch('/api/settings');
            const data = await res.json();
            state.settings = data;

            settingProvider.value = data.active_provider || 'groq';
            settingModel.value = data.active_model || 'openai/gpt-oss-120b';

            if (data.gemini_api_key_set) {
                geminiKeyStatus.textContent = `Configured (${data.gemini_api_key_masked})`;
                geminiKeyStatus.style.color = 'var(--emerald)';
            } else {
                geminiKeyStatus.textContent = 'Not Set';
                geminiKeyStatus.style.color = 'var(--rose)';
            }

            if (data.groq_api_key_set) {
                groqKeyStatus.textContent = `Configured (${data.groq_api_key_masked})`;
                groqKeyStatus.style.color = 'var(--emerald)';
            } else {
                groqKeyStatus.textContent = 'Not Set';
                groqKeyStatus.style.color = 'var(--rose)';
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

    if (settingProvider) {
        settingProvider.addEventListener('change', () => {
            const p = settingProvider.value;
            if (p === 'groq') {
                settingModel.value = 'openai/gpt-oss-120b';
            } else if (p === 'gemini') {
                settingModel.value = 'gemini-3.6-flash';
            } else if (p === 'openai') {
                settingModel.value = 'gpt-4o';
            } else if (p === 'ollama') {
                settingModel.value = 'llama3';
            }
        });
    }

    btnSaveSettings.addEventListener('click', async () => {
        const payload = {
            active_provider: settingProvider.value,
            active_model: settingModel.value.trim(),
            gemini_api_key: settingGeminiKey.value.trim() || undefined,
            groq_api_key: settingGroqKey.value.trim() || undefined,
            openai_api_key: settingOpenaiKey.value.trim() || undefined
        };

        const res = await apiFetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Settings & API credentials saved!');
            settingGeminiKey.value = '';
            settingGroqKey.value = '';
            settingOpenaiKey.value = '';
            loadSettings();
        }
    });

    // Export / Import
    btnExportData.addEventListener('click', async () => {
        const res = await apiFetch('/api/export');
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aegis_personal_ai_backup_${state.userId}_${new Date().toISOString().slice(0, 10)}.json`;
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
            const res = await apiFetch('/api/import', {
                method: 'POST',
                body: JSON.stringify(parsed)
            });
            if (res.ok) {
                const data = await res.json();
                showToast(`Data restored successfully (${data.imported_memories_count} memories)`);
                loadMemories();
                loadProfile();
                loadPersona();
            }
        } catch (err) {
            alert('Invalid backup JSON file.');
        }
    });

    // --- Chat Sessions Management ---

    async function loadSessions() {
        try {
            const res = await apiFetch('/api/sessions');
            const data = await res.json();
            renderSessionsList(data.sessions || []);
        } catch (e) {
            console.error('Error loading sessions:', e);
        }
    }

    function renderSessionsList(sessions) {
        sessionsList.innerHTML = '';
        if (sessions.length === 0) {
            sessionsList.innerHTML = `<p style="padding: 12px; font-size: 13px; color: var(--text-dim);">No conversation threads yet.</p>`;
            return;
        }

        sessions.forEach(s => {
            const item = document.createElement('div');
            item.className = `session-item ${s.id === state.sessionId ? 'active' : ''}`;
            item.innerHTML = `
                <span class="session-title" title="${escapeHtml(s.title)}">
                    <i class="fa-regular fa-message" style="margin-right: 6px;"></i> ${escapeHtml(s.title)}
                </span>
                <button class="icon-btn danger delete-session-btn" data-id="${s.id}" title="Delete Chat"><i class="fa-solid fa-trash"></i></button>
            `;
            item.addEventListener('click', () => switchSession(s.id, s.title));
            sessionsList.appendChild(item);
        });

        document.querySelectorAll('.delete-session-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (confirm('Delete this conversation?')) {
                    await apiFetch(`/api/sessions/${id}`, { method: 'DELETE' });
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
        const res = await apiFetch(`/api/sessions/${sessionId}/messages`);
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
                <div class="welcome-tag">Personal Memory Vault Active</div>
                <h2 class="welcome-greeting">Hey there, <span class="gradient-text" id="welcome-user-name">${state.persona.user_name || 'Friend'}</span>!</h2>
                <p class="welcome-desc">
                    I am your dedicated personal AI companion. Everything you share about your code, projects, food, habits, and ideas stays safely remembered in your isolated vault!
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
                        <span>Vault: <strong>Private SQLite</strong></span>
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

    // --- Chat SSE Streaming ---

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSendMessage();
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text || state.isStreaming) return;

        // Remove welcome card if visible
        const welcomeCard = chatMessages.querySelector('.welcome-card');
        if (welcomeCard) welcomeCard.remove();

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
            const response = await apiFetch('/api/chat', {
                method: 'POST',
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
                buffer = lines.pop();

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

    // --- User Profile Switcher Operations ---

    async function loadUsersList() {
        try {
            const res = await apiFetch('/api/users');
            const data = await res.json();
            state.users = data.users || [];
            renderUsersList();
        } catch (e) {
            console.error('Error loading users list:', e);
        }
    }

    function renderUsersList() {
        if (!usersProfileList) return;
        usersProfileList.innerHTML = '';

        if (state.users.length === 0) {
            usersProfileList.innerHTML = '<p style="color: var(--text-dim); padding: 10px;">No registered profiles found.</p>';
            return;
        }

        state.users.forEach(u => {
            const isCurrent = u.id === state.userId;
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 14px;
                background: ${isCurrent ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.15))' : 'var(--bg-surface)'};
                border: 1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-card)'};
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all 0.2s;
            `;

            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--cyan)); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 14px;">
                        ${(u.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-size: 14px; font-weight: 600; color: #fff;">
                            ${escapeHtml(u.name)} ${isCurrent ? '<span style="font-size: 11px; color: var(--emerald); background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 99px; margin-left: 6px;">Active</span>' : ''}
                        </div>
                        <div style="font-size: 11.5px; color: var(--text-muted);">Nickname: ${escapeHtml(u.nickname || u.name)}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    ${!isCurrent ? `<button class="btn btn-sm btn-primary switch-to-user-btn" data-id="${u.id}">Switch</button>` : ''}
                    ${state.users.length > 1 ? `<button class="icon-btn danger delete-user-btn" data-id="${u.id}" title="Delete User Profile"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            `;

            usersProfileList.appendChild(item);
        });

        // Bind Switch
        document.querySelectorAll('.switch-to-user-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const targetId = btn.getAttribute('data-id');
                await switchToUser(targetId);
            });
        });

        // Bind Delete User
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const targetId = btn.getAttribute('data-id');
                if (confirm('Delete this user profile and all their isolated memories & chat history?')) {
                    await apiFetch(`/api/users/${targetId}`, { method: 'DELETE' });
                    showToast('User profile removed');
                    if (state.userId === targetId) {
                        state.userId = 'default';
                        localStorage.setItem('aegis_user_id', 'default');
                    }
                    await loadUsersList();
                    await initApp();
                }
            });
        });
    }

    async function switchToUser(userId) {
        state.userId = userId;
        localStorage.setItem('aegis_user_id', userId);
        if (userSwitchModal) userSwitchModal.classList.add('hidden');
        showToast('Switched user profile');
        await initApp();
    }

    if (btnSwitchUser) {
        btnSwitchUser.addEventListener('click', async () => {
            await loadUsersList();
            if (userSwitchModal) userSwitchModal.classList.remove('hidden');
        });
    }

    if (btnCloseSwitchModal) btnCloseSwitchModal.addEventListener('click', () => userSwitchModal.classList.add('hidden'));
    if (btnCancelSwitchModal) btnCancelSwitchModal.addEventListener('click', () => userSwitchModal.classList.add('hidden'));

    if (btnCreateNewUserProfile) {
        btnCreateNewUserProfile.addEventListener('click', () => {
            if (userSwitchModal) userSwitchModal.classList.add('hidden');
            // Generate a fresh unique user_id for the new user
            state.userId = 'usr_' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('aegis_user_id', state.userId);
            
            if (onboardName) onboardName.value = '';
            if (onboardNickname) onboardNickname.value = '';
            if (onboardOccupation) onboardOccupation.value = '';
            if (onboardGoals) onboardGoals.value = '';
            if (onboardPreferences) onboardPreferences.value = '';
            if (onboardingModal) onboardingModal.classList.remove('hidden');
        });
    }

    // --- Onboarding & First-Time Setup Wizard ---

    function checkFirstTimeOnboarding() {
        const onboarded = localStorage.getItem(`aegis_onboarded_${state.userId}`);
        const hasProfileName = state.profile.name && state.profile.name.value;
        if (!onboarded && !hasProfileName) {
            setTimeout(() => {
                if (onboardingModal) onboardingModal.classList.remove('hidden');
            }, 600);
        }
    }

    if (btnSkipOnboarding) {
        btnSkipOnboarding.addEventListener('click', () => {
            localStorage.setItem(`aegis_onboarded_${state.userId}`, 'true');
            if (onboardingModal) onboardingModal.classList.add('hidden');
        });
    }

    if (onboardingForm) {
        if (onboardName) {
            onboardName.addEventListener('input', () => {
                if (!onboardNickname.value.trim() || onboardNickname.dataset.autoFilled === 'true') {
                    const parts = onboardName.value.trim().split(' ');
                    onboardNickname.value = parts[0] || '';
                    onboardNickname.dataset.autoFilled = 'true';
                }
            });
        }

        if (onboardNickname) {
            onboardNickname.addEventListener('input', () => {
                onboardNickname.dataset.autoFilled = 'false';
            });
        }

        onboardingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = onboardName.value.trim();
            const nickname = onboardNickname.value.trim() || name;
            const occupation = onboardOccupation ? onboardOccupation.value.trim() : '';
            const goals = onboardGoals ? onboardGoals.value.trim() : '';
            const preferences = onboardPreferences ? onboardPreferences.value.trim() : '';
            const tone = onboardTone ? onboardTone.value : 'Empathetic Companion';

            if (!name) {
                alert('Please enter your name.');
                return;
            }

            try {
                const res = await apiFetch('/api/onboarding', {
                    method: 'POST',
                    body: JSON.stringify({
                        user_id: state.userId,
                        name: name,
                        preferred_nickname: nickname,
                        occupation: occupation,
                        primary_goals: goals,
                        communication_preference: preferences,
                        tone_preset: tone
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.user_id) {
                        state.userId = data.user_id;
                        localStorage.setItem('aegis_user_id', state.userId);
                    }
                    localStorage.setItem(`aegis_onboarded_${state.userId}`, 'true');
                    if (onboardingModal) onboardingModal.classList.add('hidden');
                    showToast(`Welcome, ${nickname}! Your AI companion is personalized and ready.`);

                    // Reload system state
                    await loadProfile();
                    await loadPersona();
                    await loadMemories();
                    
                    // Reset to a new conversation personalized for this user
                    startNewChat();
                } else {
                    showToast('Failed to initialize onboarding', 'error');
                }
            } catch (err) {
                showToast('Error during initialization', 'error');
            }
        });
    }

    // --- App Init ---
    async function initApp() {
        await loadPersona();
        await loadMemories();
        await loadProfile();
        await loadSettings();
        if (state.sessionId) {
            switchSession(state.sessionId, 'Current Session');
        } else {
            startNewChat();
        }
        checkFirstTimeOnboarding();
    }

    initApp();
});
