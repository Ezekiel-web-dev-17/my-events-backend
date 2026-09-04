/**
 * Eventra Notification Center Frontend
 * Clean Vanilla JS implementation adhering strictly to Secure Web Skills:
 * - Zero innerHTML usage (uses document.createElement, textContent, replaceChildren)
 * - In-memory token management (no localStorage / sessionStorage token persistence)
 * - Accessible custom modals (no native alert() / confirm())
 * - Clean DOMParser/createElementNS for SVG icons
 */

(function () {
  'use strict';

  // Application In-Memory State
  const state = {
    serverUrl: 'http://localhost:5500',
    token: null,
    currentUser: null,
    socket: null,
    notifications: [],
    filter: 'all', // 'all' | 'unread'
    unreadCount: 0,
    pendingDeleteId: null,
  };

  // SVG Helper to avoid innerHTML
  function createSvgIcon(type) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    if (type === 'check') {
      const polyline = document.createElementNS(svgNS, 'polyline');
      polyline.setAttribute('points', '20 6 9 17 4 12');
      svg.appendChild(polyline);
    } else if (type === 'trash') {
      const path1 = document.createElementNS(svgNS, 'polyline');
      path1.setAttribute('points', '3 6 5 6 21 6');
      const path2 = document.createElementNS(svgNS, 'path');
      path2.setAttribute('d', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2');
      svg.appendChild(path1);
      svg.appendChild(path2);
    } else if (type === 'bell') {
      const path1 = document.createElementNS(svgNS, 'path');
      path1.setAttribute('d', 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9');
      const path2 = document.createElementNS(svgNS, 'path');
      path2.setAttribute('d', 'M13.73 21a2 2 0 0 1-3.46 0');
      svg.appendChild(path1);
      svg.appendChild(path2);
    }
    return svg;
  }

  // Format timestamp safely
  function formatTimestamp(timestamp) {
    if (!timestamp) return 'Just now';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  }

  // DOM Elements Cache
  const elements = {
    serverUrlInput: document.getElementById('server-url-input'),
    authSection: document.getElementById('auth-section'),
    dashboardSection: document.getElementById('dashboard-section'),
    tabAuthLogin: document.getElementById('tab-auth-login'),
    tabAuthToken: document.getElementById('tab-auth-token'),
    loginForm: document.getElementById('login-form'),
    tokenForm: document.getElementById('token-form'),
    loginEmailInput: document.getElementById('login-email-input'),
    loginPasswordInput: document.getElementById('login-password-input'),
    directTokenInput: document.getElementById('direct-token-input'),
    authFeedback: document.getElementById('auth-feedback'),
    connectionStatus: document.getElementById('connection-status'),
    statusText: document.getElementById('status-text'),
    unreadCountBadge: document.getElementById('unread-count-badge'),
    totalCountBadge: document.getElementById('total-count-badge'),
    unreadTabBadge: document.getElementById('unread-tab-badge'),
    userProfileBar: document.getElementById('user-profile-bar'),
    userDisplayName: document.getElementById('user-display-name'),
    userRoleBadge: document.getElementById('user-role-badge'),
    signOutBtn: document.getElementById('sign-out-btn'),
    filterAllBtn: document.getElementById('filter-all-btn'),
    filterUnreadBtn: document.getElementById('filter-unread-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    markAllReadBtn: document.getElementById('mark-all-read-btn'),
    openTestModalBtn: document.getElementById('open-test-modal-btn'),
    notificationsList: document.getElementById('notifications-list'),
    emptyState: document.getElementById('empty-state'),
    toastContainer: document.getElementById('toast-container'),
    // Modals
    testModal: document.getElementById('test-modal'),
    closeTestModalBtn: document.getElementById('close-test-modal-btn'),
    cancelTestModalBtn: document.getElementById('cancel-test-modal-btn'),
    testForm: document.getElementById('test-notification-form'),
    testTitleInput: document.getElementById('test-title-input'),
    testAboutInput: document.getElementById('test-about-input'),
    testContentInput: document.getElementById('test-content-input'),
    confirmModal: document.getElementById('confirm-modal'),
    closeConfirmModalBtn: document.getElementById('close-confirm-modal-btn'),
    cancelConfirmBtn: document.getElementById('cancel-confirm-btn'),
    proceedDeleteBtn: document.getElementById('proceed-delete-btn'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
  };

  // Set Default Server URL from current origin if hosted on server
  if (window.location.origin && window.location.origin.startsWith('http')) {
    elements.serverUrlInput.value = window.location.origin;
    state.serverUrl = window.location.origin;
  }

  // ==========================================================
  // Feedback and Toast Alerts
  // ==========================================================
  function showAuthFeedback(message, isError = false) {
    elements.authFeedback.textContent = message;
    elements.authFeedback.className = isError
      ? 'feedback-banner feedback-error'
      : 'feedback-banner feedback-success';
    elements.authFeedback.classList.remove('hidden');
  }

  function hideAuthFeedback() {
    elements.authFeedback.textContent = '';
    elements.authFeedback.classList.add('hidden');
  }

  function showToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'toast-icon';
    iconWrapper.appendChild(createSvgIcon('bell'));

    const body = document.createElement('div');
    body.className = 'toast-body';

    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;

    const msgEl = document.createElement('div');
    msgEl.className = 'toast-message';
    msgEl.textContent = message;

    body.appendChild(titleEl);
    body.appendChild(msgEl);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close toast');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });

    toast.appendChild(iconWrapper);
    toast.appendChild(body);
    toast.appendChild(closeBtn);

    elements.toastContainer.appendChild(toast);

    // Auto dismiss after 5s
    setTimeout(() => {
      if (toast.isConnected) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 250ms ease-out';
        setTimeout(() => toast.remove(), 250);
      }
    }, 5000);
  }

  // ==========================================================
  // Socket.io Integration
  // ==========================================================
  function setConnectionStatus(status) {
    elements.connectionStatus.className = 'status-badge';
    if (status === 'connected') {
      elements.connectionStatus.classList.add('status-connected');
      elements.statusText.textContent = 'Live Socket Connected';
    } else if (status === 'connecting') {
      elements.connectionStatus.classList.add('status-connecting');
      elements.statusText.textContent = 'Connecting...';
    } else {
      elements.connectionStatus.classList.add('status-disconnected');
      elements.statusText.textContent = 'Disconnected';
    }
  }

  function initSocketConnection() {
    if (state.socket) {
      state.socket.disconnect();
      state.socket = null;
    }

    if (typeof io === 'undefined') {
      setConnectionStatus('disconnected');
      showToast('Socket Error', 'Socket.io client library is not loaded');
      return;
    }

    setConnectionStatus('connecting');

    try {
      state.socket = io(state.serverUrl, {
        auth: { token: state.token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1500,
      });

      state.socket.on('connect', () => {
        setConnectionStatus('connected');
        // Join admin room
        state.socket.emit('adminRoom', 'admin');
      });

      state.socket.on('adminRoom', (msg) => {
        showToast('Room Joined', typeof msg === 'string' ? msg : 'Joined admin notifications room');
      });

      state.socket.on('adminMessage', (payload) => {
        const title = payload.title || 'New Admin Notification';
        const content = payload.content || '';
        showToast(title, content);

        // Prepend to local notifications list
        const newNotif = {
          _id: payload._id || 'temp-' + Date.now(),
          title: payload.title,
          content: payload.content,
          about: payload.about || 'General',
          views: [],
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        state.notifications.unshift(newNotif);
        updateCounters();
        renderNotifications();
      });

      state.socket.on('error', (errMessage) => {
        setConnectionStatus('disconnected');
        showToast('Socket Authorization Error', errMessage || 'Permission denied');
      });

      state.socket.on('disconnect', () => {
        setConnectionStatus('disconnected');
      });

      state.socket.on('connect_error', () => {
        setConnectionStatus('disconnected');
      });
    } catch {
      setConnectionStatus('disconnected');
    }
  }

  // ==========================================================
  // REST API Client
  // ==========================================================
  async function apiRequest(endpoint, options = {}) {
    const url = `${state.serverUrl.replace(/\/$/, '')}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }

    const response = await fetch(url, { ...options, headers });
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    if (!response.ok) {
      const errorMsg = data.message || `Request failed (${response.status})`;
      throw new Error(errorMsg);
    }

    return data;
  }

  async function fetchNotifications() {
    try {
      elements.refreshBtn.disabled = true;
      const data = await apiRequest('/api/notifications/');
      state.notifications = data.notifications || [];
      updateCounters();
      renderNotifications();
    } catch (err) {
      showToast('Error', err.message);
    } finally {
      elements.refreshBtn.disabled = false;
    }
  }

  async function markNotificationAsRead(id) {
    try {
      await apiRequest(`/api/notifications/mark/${id}`, { method: 'PATCH' });
      // Update local state
      const target = state.notifications.find((n) => n._id === id);
      if (target && state.currentUser?.userId) {
        if (!target.views) target.views = [];
        target.views.push(state.currentUser.userId);
      }
      updateCounters();
      renderNotifications();
      showToast('Success', 'Notification marked as read');
    } catch (err) {
      showToast('Action Failed', err.message);
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      elements.markAllReadBtn.disabled = true;
      await apiRequest('/api/notifications/mark-all', { method: 'PATCH' });
      if (state.currentUser?.userId) {
        state.notifications.forEach((n) => {
          if (!n.views) n.views = [];
          if (!n.views.some((v) => v.toString() === state.currentUser.userId.toString())) {
            n.views.push(state.currentUser.userId);
          }
        });
      }
      updateCounters();
      renderNotifications();
      showToast('Success', 'All notifications marked as read');
    } catch (err) {
      showToast('Action Failed', err.message);
    } finally {
      elements.markAllReadBtn.disabled = false;
    }
  }

  async function deleteNotification(id) {
    try {
      await apiRequest(`/api/notifications/delete/${id}`, { method: 'DELETE' });
      state.notifications = state.notifications.filter((n) => n._id !== id);
      updateCounters();
      renderNotifications();
      showToast('Success', 'Notification deleted');
    } catch (err) {
      showToast('Delete Failed', err.message);
    }
  }

  // ==========================================================
  // Counters & Rendering
  // ==========================================================
  function isUnread(notification) {
    if (!state.currentUser?.userId) return true;
    const views = notification.views || [];
    return !views.some((v) => v.toString() === state.currentUser.userId.toString());
  }

  function updateCounters() {
    const total = state.notifications.length;
    const unread = state.notifications.filter(isUnread).length;

    state.unreadCount = unread;
    elements.unreadCountBadge.textContent = String(unread);
    elements.totalCountBadge.textContent = String(total);
    elements.unreadTabBadge.textContent = String(unread);
  }

  function renderNotifications() {
    elements.notificationsList.replaceChildren();

    const items = state.notifications.filter((n) => {
      if (state.filter === 'unread') {
        return isUnread(n);
      }
      return true;
    });

    if (items.length === 0) {
      elements.emptyState.classList.remove('hidden');
      return;
    }

    elements.emptyState.classList.add('hidden');

    items.forEach((item) => {
      const unread = isUnread(item);

      const card = document.createElement('div');
      card.className = unread ? 'notify-item unread' : 'notify-item';

      const main = document.createElement('div');
      main.className = 'notify-main';

      // Header row
      const header = document.createElement('div');
      header.className = 'notify-header';

      const title = document.createElement('h3');
      title.className = 'notify-title';
      title.textContent = item.title || 'Untitled Notification';

      const tag = document.createElement('span');
      tag.className = 'notify-tag';
      tag.textContent = item.about || 'Eventra';

      header.appendChild(title);
      header.appendChild(tag);

      if (unread) {
        const unreadBadge = document.createElement('span');
        unreadBadge.className = 'notify-unread-indicator';
        unreadBadge.textContent = 'Unread';
        header.appendChild(unreadBadge);
      }

      // Content
      const content = document.createElement('p');
      content.className = 'notify-content';
      content.textContent = item.content || '';

      // Meta
      const meta = document.createElement('div');
      meta.className = 'notify-meta';
      const timeSpan = document.createElement('span');
      timeSpan.textContent = formatTimestamp(item.createdAt);
      meta.appendChild(timeSpan);

      main.appendChild(header);
      main.appendChild(content);
      main.appendChild(meta);

      // Actions
      const actions = document.createElement('div');
      actions.className = 'notify-actions';

      if (unread) {
        const markReadBtn = document.createElement('button');
        markReadBtn.className = 'action-icon-btn';
        markReadBtn.type = 'button';
        markReadBtn.title = 'Mark as read';
        markReadBtn.appendChild(createSvgIcon('check'));
        markReadBtn.addEventListener('click', () => {
          markNotificationAsRead(item._id);
        });
        actions.appendChild(markReadBtn);
      }

      // Delete action (superAdmin or admin)
      if (state.currentUser?.role === 'superAdmin' || state.currentUser?.role === 'admin') {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-icon-btn delete';
        deleteBtn.type = 'button';
        deleteBtn.title = 'Delete notification';
        deleteBtn.appendChild(createSvgIcon('trash'));
        deleteBtn.addEventListener('click', () => {
          openConfirmDeleteModal(item._id, item.title);
        });
        actions.appendChild(deleteBtn);
      }

      card.appendChild(main);
      card.appendChild(actions);

      elements.notificationsList.appendChild(card);
    });
  }

  // ==========================================================
  // Auth Handlers
  // ==========================================================
  function handleSuccessfulAuth(token, user) {
    state.token = token;
    state.currentUser = user || { role: 'admin', firstname: 'Admin' };

    // Update Header Profile
    elements.userDisplayName.textContent = user?.firstname
      ? `${user.firstname} ${user.lastname || ''}`
      : 'Admin User';
    elements.userRoleBadge.textContent = user?.role || 'admin';
    elements.userProfileBar.classList.remove('hidden');

    // Toggle Panels
    elements.authSection.classList.add('hidden');
    elements.dashboardSection.classList.remove('hidden');

    hideAuthFeedback();

    // Start Realtime & Fetch Initial Data
    initSocketConnection();
    fetchNotifications();
  }

  function handleSignOut() {
    state.token = null;
    state.currentUser = null;
    state.notifications = [];

    if (state.socket) {
      state.socket.disconnect();
      state.socket = null;
    }

    setConnectionStatus('disconnected');
    elements.userProfileBar.classList.add('hidden');
    elements.dashboardSection.classList.add('hidden');
    elements.authSection.classList.remove('hidden');
    elements.notificationsList.replaceChildren();

    showAuthFeedback('Signed out successfully.');
  }

  // ==========================================================
  // Modals Management
  // ==========================================================
  function openTestModal() {
    elements.testTitleInput.value = 'New Event Registration';
    elements.testAboutInput.value = 'Annual Tech Summit 2026';
    elements.testContentInput.value = 'A attendee just purchased a VIP Pass for Annual Tech Summit 2026.';
    elements.testModal.classList.remove('hidden');
    elements.testTitleInput.focus();
  }

  function closeTestModal() {
    elements.testModal.classList.add('hidden');
  }

  function openConfirmDeleteModal(id, title) {
    state.pendingDeleteId = id;
    elements.confirmModalMessage.textContent = `Are you sure you want to delete "${title || 'this notification'}"? This action cannot be undone.`;
    elements.confirmModal.classList.remove('hidden');
  }

  function closeConfirmDeleteModal() {
    state.pendingDeleteId = null;
    elements.confirmModal.classList.add('hidden');
  }

  // ==========================================================
  // Event Listeners Setup
  // ==========================================================
  function setupEventListeners() {
    // Server URL sync
    elements.serverUrlInput.addEventListener('change', (e) => {
      state.serverUrl = e.target.value.trim() || 'http://localhost:5500';
    });

    // Auth tab toggling
    elements.tabAuthLogin.addEventListener('click', () => {
      elements.tabAuthLogin.classList.add('active');
      elements.tabAuthToken.classList.remove('active');
      elements.loginForm.classList.remove('hidden');
      elements.tokenForm.classList.add('hidden');
      hideAuthFeedback();
    });

    elements.tabAuthToken.addEventListener('click', () => {
      elements.tabAuthToken.classList.add('active');
      elements.tabAuthLogin.classList.remove('active');
      elements.tokenForm.classList.remove('hidden');
      elements.loginForm.classList.add('hidden');
      hideAuthFeedback();
    });

    // Login Form Submit
    elements.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      state.serverUrl = elements.serverUrlInput.value.trim() || 'http://localhost:5500';
      const email = elements.loginEmailInput.value.trim();
      const password = elements.loginPasswordInput.value;

      if (!email || !password) {
        showAuthFeedback('Please provide both email and password.', true);
        return;
      }

      try {
        const submitBtn = document.getElementById('login-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';

        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (!data.token) {
          throw new Error('Authentication succeeded but no token was returned.');
        }

        handleSuccessfulAuth(data.token, data.user);
      } catch (err) {
        showAuthFeedback(err.message, true);
      } finally {
        const submitBtn = document.getElementById('login-submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In & Connect';
      }
    });

    // Direct Token Submit
    elements.tokenForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.serverUrl = elements.serverUrlInput.value.trim() || 'http://localhost:5500';
      const token = elements.directTokenInput.value.trim();

      if (!token) {
        showAuthFeedback('Please enter a valid Bearer JWT token.', true);
        return;
      }

      // Decode JWT payload safely without external dependencies
      let user = { role: 'admin', firstname: 'Admin' };
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          user = {
            userId: payload.userId || payload.id,
            email: payload.email,
            role: payload.role || 'admin',
            firstname: payload.firstname || 'Admin',
          };
        }
      } catch {
        // Fallback user defaults if decoding fails
      }

      handleSuccessfulAuth(token, user);
    });

    // Sign Out
    elements.signOutBtn.addEventListener('click', handleSignOut);

    // Filter Buttons
    elements.filterAllBtn.addEventListener('click', () => {
      state.filter = 'all';
      elements.filterAllBtn.classList.add('active');
      elements.filterUnreadBtn.classList.remove('active');
      renderNotifications();
    });

    elements.filterUnreadBtn.addEventListener('click', () => {
      state.filter = 'unread';
      elements.filterUnreadBtn.classList.add('active');
      elements.filterAllBtn.classList.remove('active');
      renderNotifications();
    });

    // Toolbar Actions
    elements.refreshBtn.addEventListener('click', fetchNotifications);
    elements.markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    elements.openTestModalBtn.addEventListener('click', openTestModal);

    // Test Modal Actions
    elements.closeTestModalBtn.addEventListener('click', closeTestModal);
    elements.cancelTestModalBtn.addEventListener('click', closeTestModal);
    elements.testForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = elements.testTitleInput.value.trim();
      const about = elements.testAboutInput.value.trim();
      const content = elements.testContentInput.value.trim();

      if (!title || !about || !content) {
        showToast('Validation Error', 'All fields are required');
        return;
      }

      if (!state.socket || !state.socket.connected) {
        showToast('Socket Error', 'Socket is not connected. Reconnect to emit events.');
        return;
      }

      state.socket.emit('adminMessage', {
        room: 'admin',
        obj: {
          title,
          about,
          content,
          createdAt: Date.now(),
        },
      });

      closeTestModal();
      showToast('Event Emitted', `Emitted "${title}" to admin room`);
    });

    // Confirm Delete Modal Actions
    elements.closeConfirmModalBtn.addEventListener('click', closeConfirmDeleteModal);
    elements.cancelConfirmBtn.addEventListener('click', closeConfirmDeleteModal);
    elements.proceedDeleteBtn.addEventListener('click', () => {
      if (state.pendingDeleteId) {
        deleteNotification(state.pendingDeleteId);
      }
      closeConfirmDeleteModal();
    });
  }

  // Initialize
  setupEventListeners();
})();
