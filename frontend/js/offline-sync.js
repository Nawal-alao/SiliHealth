// Offline Sync Manager - handles local storage and sync queue
window.OfflineSyncManager = (function() {
  const SYNC_QUEUE_KEY = 'healid_sync_queue';
  const PENDING_DATA_KEY = 'healid_pending_data';

  // Lightweight gated logger: enable by setting `window.__HEALID_DEBUG__ = true` on dev hosts
  const __HEALID_DEBUG__ = (typeof window !== 'undefined' && window.__HEALID_DEBUG__ !== undefined)
    ? !!window.__HEALID_DEBUG__
    : (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1'));

  function _log(...args) { if (__HEALID_DEBUG__) console.log(...args); }
  function _warn(...args) { if (__HEALID_DEBUG__) console.warn(...args); }
  function _error(...args) { if (__HEALID_DEBUG__) console.error(...args); }

  // Add item to sync queue (when offline)
  function queueForSync(entityType, entityId, action, data) {
    try {
      const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
      queue.push({
        id: `${Date.now()}-${Math.random()}`,
        entityType,
        entityId,
        action,
        data,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      return true;
    } catch (e) {
      _error('Error queueing for sync', e);
      return false;
    }
  }

  // Get pending items
  function getPendingItems() {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  // Clear queue after successful sync
  function clearQueue() {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  }

  // Sync pending data with server
  async function syncPendingData() {
    const pending = getPendingItems();
    if (pending.length === 0) {
      _log('✓ No pending items to sync');
      return { ok: true, synced: 0 };
    }

    try {
      const apiBase = window.API_BASE || 'http://localhost:4000';
      const token = localStorage.getItem('healid_token');

      if (!token) {
        _warn('No token available, cannot sync');
        return { ok: false, error: 'Not authenticated' };
      }

      // Send sync request to backend
      const response = await fetch(`${apiBase}/api/sync/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pending }),
      });

      const result = await response.json();

      if (result.ok) {
        _log(`✓ Synced ${result.syncedCount} items`);
        clearQueue();
        // Notify user
        try {
          window.showToast(`${result.syncedCount} items synchronized`, 'success');
        } catch (e) { /* ignore */ }
        return { ok: true, synced: result.syncedCount };
      } else {
        _error('Sync failed:', result.error);
        return { ok: false, error: result.error };
      }
    } catch (error) {
      _error('Error syncing data:', error);
      return { ok: false, error: error.message };
    }
  }

  // Listen for online/offline events
  function setupOnlineListener() {
    window.addEventListener('online', async () => {
      _log('🌐 Back online - attempting to sync...');
      try {
        const result = await syncPendingData();
        if (result.ok) {
          _log('✓ Sync completed successfully');
        }
      } catch (e) {
        _error('Sync error:', e);
      }
    });

    window.addEventListener('offline', () => {
      _log('📡 Offline mode activated');
    });
  }

  // Store patient data locally for offline access
  function storePatientDataLocally(patientData) {
    try {
      localStorage.setItem(PENDING_DATA_KEY, JSON.stringify(patientData));
    } catch (e) {
      _warn('Could not store offline data:', e);
    }
  }

  // Retrieve locally stored patient data
  function getLocalPatientData() {
    try {
      return JSON.parse(localStorage.getItem(PENDING_DATA_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  // Public API
  return {
    queueForSync,
    getPendingItems,
    syncPendingData,
    setupOnlineListener,
    storePatientDataLocally,
    getLocalPatientData,
    clearQueue,
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.OfflineSyncManager.setupOnlineListener();
});

// Expose sync function globally for manual triggers
window.manualSync = async function() {
  const result = await window.OfflineSyncManager.syncPendingData();
  return result;
};
