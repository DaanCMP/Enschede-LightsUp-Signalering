class SignsDashboard {
    constructor() {
        this.signs = new Map();
        this.eventSource = null;
        this.keepAliveInterval = null;
        this.pollingInterval = null;
        this.sseFailures = 0;
        this.init();
    }

    init() {
        console.log('Initializing dashboard...');
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.loadInitialData();
    }

    setupEventListeners() {
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadInitialData();
        });

        document.getElementById('test-all-btn').addEventListener('click', () => {
            this.testAllSigns();
        });

        document.getElementById('map-btn').addEventListener('click', () => {
            window.open('/map.html', '_blank');
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible, refreshing connection...');
                this.loadInitialData();
                this.startRealTimeUpdates();
            }
        });

        // Handle page focus
        window.addEventListener('focus', () => {
            console.log('Window focused, checking connection...');
            this.loadInitialData();
        });
    }

    async loadInitialData() {
        try {
            const response = await fetch('/api/signs');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const signs = await response.json();
            
            this.signs.clear();
            signs.forEach(sign => {
                this.signs.set(sign.id, sign);
            });
            
            this.renderSigns();
            this.updateConnectionStatus('online');
        } catch (error) {
            console.error('Failed to load signs:', error);
            this.updateConnectionStatus('offline');
        }
    }

    startRealTimeUpdates() {
        if (this.eventSource) {
            this.eventSource.close();
        }
        
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
        
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.eventSource = new EventSource('/api/signs/events');
        
        this.eventSource.onopen = () => {
            console.log('SSE connection opened');
            this.updateConnectionStatus('online');
        };

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleSignUpdate(data);
            } catch (error) {
                console.error('Failed to parse SSE data:', error);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            console.error('SSE readyState:', this.eventSource.readyState);
            this.sseFailures++;
            this.updateConnectionStatus('offline');
            
            // If SSE fails too many times, fall back to polling
            if (this.sseFailures >= 3) {
                console.log('SSE failed too many times, switching to polling...');
                this.startPolling();
                return;
            }
            
            // Attempt to reconnect after 2 seconds
            setTimeout(() => {
                console.log('Attempting to reconnect SSE...');
                this.startRealTimeUpdates();
            }, 2000);
        };

        // Keep connection alive by sending periodic pings
        this.keepAliveInterval = setInterval(() => {
            if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
                console.log('SSE connection alive');
            } else {
                console.log('SSE connection lost, reconnecting...');
                this.startRealTimeUpdates();
            }
        }, 30000); // Check every 30 seconds
    }

    startPolling() {
        console.log('Starting polling fallback...');
        this.updateConnectionStatus('online');
        
        // Poll every 5 seconds
        this.pollingInterval = setInterval(() => {
            this.loadInitialData();
        }, 5000);
    }

    handleSignUpdate(data) {
        if (data.type === 'sign_update') {
            this.signs.set(data.sign.id, data.sign);
            this.renderSigns();
        } else if (data.type === 'sign_status') {
            const sign = this.signs.get(data.signId);
            if (sign) {
                Object.assign(sign, data.updates);
                this.renderSigns();
            }
        }
    }

    renderSigns() {
        const grid = document.getElementById('signs-grid');
        grid.innerHTML = '';

        if (this.signs.size === 0) {
            grid.innerHTML = '<div class="no-signs">No signs found. Make sure your ESP32 is connected and registered.</div>';
            return;
        }

        this.signs.forEach(sign => {
            const signCard = this.createSignCard(sign);
            grid.appendChild(signCard);
        });
    }

    createSignCard(sign) {
        const card = document.createElement('div');
        card.className = `sign-card status-${sign.status || 'offline'}`;
        
        const lastSeen = this.formatLastSeen(sign.last_seen);
        const batteryLevel = this.getBatteryLevel(sign.battery);
        const direction = this.getDirectionArrow(sign.current_mode);
        
        card.innerHTML = `
            <div class="sign-content">
                <div class="sign-info">
                    <div class="sign-header">
                        <div class="sign-name">${sign.nickname || sign.name || sign.id}</div>
                        <div class="sign-id">${sign.id}</div>
                    </div>
                    <div class="status-badge ${sign.status || 'offline'}">${sign.status || 'offline'}</div>
                </div>
                
                <div class="sign-details">
                    <div class="detail-item battery">
                        <div class="detail-label">Battery</div>
                        <div class="battery">
                            <div class="battery-bar">
                                <div class="battery-fill ${batteryLevel.class}" style="width: ${sign.battery || 0}%"></div>
                            </div>
                            <span class="battery-percentage">${sign.battery || 0}%</span>
                        </div>
                    </div>
                    
                    <div class="detail-item signal">
                        <div class="detail-label">Signal</div>
                        <div class="detail-value">${sign.signal || 0} dBm</div>
                    </div>
                    
                    <div class="detail-item direction">
                        <div class="detail-label">Direction</div>
                        <div class="direction">
                            <span class="direction-arrow">${direction}</span>
                            <span>${sign.current_mode || 'none'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-item last-seen">
                        <div class="detail-label">Last Seen</div>
                        <div class="detail-value">${lastSeen}</div>
                    </div>
                </div>
                
                <div class="sign-actions">
                    <button class="btn-small primary" onclick="dashboard.testSign('${sign.id}')">Test</button>
                    <button class="btn-small success" onclick="dashboard.controlSign('${sign.id}', 1)">←</button>
                    <button class="btn-small success" onclick="dashboard.controlSign('${sign.id}', 2)">→</button>
                    <button class="btn-small warning" onclick="dashboard.controlSign('${sign.id}', 3)">✚</button>
                    <button class="btn-small" onclick="dashboard.renameSign('${sign.id}')">Rename</button>
                </div>
            </div>
        `;
        
        return card;
    }

    formatLastSeen(timestamp) {
        if (!timestamp) return 'Never';
        
        // Handle both ISO string and SQLite datetime format
        let date;
        if (timestamp.includes('T')) {
            date = new Date(timestamp);
        } else {
            // SQLite format: "2024-01-20 10:30:45" - treat as UTC
            date = new Date(timestamp.replace(' ', 'T') + 'Z');
        }
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    }

    getBatteryLevel(battery) {
        if (battery >= 80) return { class: 'high' };
        if (battery >= 30) return { class: 'medium' };
        return { class: 'low' };
    }

    getDirectionArrow(mode) {
        switch (mode) {
            case 1:
            case 'left_arrow': return '←';
            case 2:
            case 'right_arrow': return '→';
            case 3:
            case 'cross': return '✚';
            default: return '○';
        }
    }

    updateConnectionStatus(status) {
        const indicator = document.getElementById('connection-status');
        indicator.textContent = status === 'online' ? 'Connected to server' : 'Disconnected from server';
        indicator.className = `status-${status}`;
    }

    async testSign(signId) {
        console.log(`🧪 Test button clicked for ${signId}`);
        
        try {
            const response = await fetch(`/api/signs/${signId}/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    command: 0 // Test state
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Test command sent to ${signId}:`, result);
            } else {
                const error = await response.text();
                console.error(`❌ Failed to send test: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.error('❌ Network error testing sign:', error);
        }
    }

    async renameSign(signId) {
        const newName = prompt(`Enter new name for sign ${signId}:`);
        if (!newName || newName.trim() === '') return;
        
        console.log(`📝 Renaming sign ${signId} to "${newName}"`);
        
        try {
            const response = await fetch(`/api/signs/${signId}/name`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: newName.trim()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Sign ${signId} renamed to "${newName}":`, result);
                // Refresh the display
                this.renderSigns();
            } else {
                const error = await response.text();
                console.error(`❌ Failed to rename sign: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.error('❌ Network error renaming sign:', error);
        }
    }

    async controlSign(signId, command) {
        console.log(`🎯 Button clicked: Sending command ${command} to ${signId}`);
        
        try {
            const response = await fetch(`/api/signs/${signId}/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    command
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Command ${command} sent successfully to ${signId}:`, result);
            } else {
                const error = await response.text();
                console.error(`❌ Failed to send command: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.error('❌ Network error controlling sign:', error);
        }
    }

    async testAllSigns() {
        const promises = Array.from(this.signs.keys()).map(signId => 
            this.testSign(signId)
        );
        
        try {
            await Promise.all(promises);
        } catch (error) {
            console.error('Failed to test all signs:', error);
        }
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new SignsDashboard();
});
