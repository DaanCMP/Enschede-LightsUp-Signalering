class SignsMap {
    constructor() {
        this.map = null;
        this.signs = new Map();
        this.markers = new Map();
        this.init();
    }

    init() {
        console.log('Initializing map...');
        this.initializeMap();
        this.loadSigns();
        this.startRealTimeUpdates();
    }

    initializeMap() {
        // Initialize map centered on Enschede, Netherlands
        this.map = L.map('map').setView([52.2200, 6.9000], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Add zoom event listener to update marker sizes
        this.map.on('zoomend', () => {
            this.updateMarkerSizes();
        });
        
        console.log('Map initialized');
    }

    async loadSigns() {
        try {
            console.log('Loading signs...');
            const response = await fetch('/api/signs');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const signs = await response.json();
            
            console.log(`Loaded ${signs.length} signs`);
            
            // Clear existing markers
            this.markers.forEach(marker => this.map.removeLayer(marker));
            this.markers.clear();
            
            // Add markers for signs that have been online (have position data)
            signs.forEach(sign => {
                if (sign.position_lat && sign.position_lon) {
                    this.addSignMarker(sign);
                }
            });
            
        } catch (error) {
            console.error('Error loading signs:', error);
        }
    }

    addSignMarker(sign) {
        const position = [sign.position_lat, sign.position_lon];
        
        // Create popup content
        const popupContent = this.createPopupContent(sign);
        
        // Calculate the actual direction people will be sent
        const actualDirection = this.calculateActualDirection(sign);
        
        // Create directional marker
        const marker = L.marker(position, {
            icon: this.createDirectionalIcon(sign, actualDirection)
        }).bindPopup(popupContent);
        
        // Add marker to map
        marker.addTo(this.map);
        this.markers.set(sign.id, marker);
        this.signs.set(sign.id, sign);
        
        console.log(`Added directional marker for sign ${sign.id} at ${position}, direction: ${actualDirection}°`);
    }

    createPopupContent(sign) {
        const statusClass = sign.status === 'online' ? 'status-online' : 'status-offline';
        const direction = this.getDirectionArrow(sign.current_mode);
        
        return `
            <div class="sign-popup">
                <h3>${sign.name || `Sign ${sign.id}`}</h3>
                <div class="status ${statusClass}">${sign.status.toUpperCase()}</div>
                <div><strong>Battery:</strong> ${sign.battery || 'N/A'}%</div>
                <div><strong>Signal:</strong> ${sign.signal || 'N/A'} dBm</div>
                <div><strong>Direction:</strong> ${direction}</div>
                <div><strong>Last Seen:</strong> ${this.formatLastSeen(sign.last_seen)}</div>
                <div class="sign-controls">
                    <button onclick="map.controlSign('${sign.id}', 0)">Test</button>
                    <button onclick="map.controlSign('${sign.id}', 1)">←</button>
                    <button onclick="map.controlSign('${sign.id}', 2)">→</button>
                    <button onclick="map.controlSign('${sign.id}', 3)">✚</button>
                </div>
            </div>
        `;
    }

    getDirectionArrow(currentMode) {
        switch(parseInt(currentMode)) {
            case 0: return '🧪 Test';
            case 1: return '← Left';
            case 2: return '→ Right';
            case 3: return '✚ Cross';
            default: return '❓ Unknown';
        }
    }

    calculateActualDirection(sign) {
        const heading = sign.heading || 0; // Sign's physical orientation (0-360°)
        const command = parseInt(sign.current_mode) || 0;
        
        // Calculate the actual direction people will be sent
        let actualDirection = heading; // Start with sign's heading
        
        switch(command) {
            case 1: // Left arrow
                actualDirection = heading - 90; // Turn left from sign's perspective
                break;
            case 2: // Right arrow  
                actualDirection = heading + 90; // Turn right from sign's perspective
                break;
            case 3: // Cross
                actualDirection = heading + 180; // Opposite direction
                break;
            case 0: // Test
            default:
                actualDirection = heading; // Same as sign's heading
                break;
        }
        
        // Normalize to 0-360 range
        while (actualDirection < 0) actualDirection += 360;
        while (actualDirection >= 360) actualDirection -= 360;
        
        return actualDirection;
    }

    createDirectionalIcon(sign, direction) {
        const isOnline = sign.status === 'online';
        const color = isOnline ? '#4CAF50' : '#f44336';
        
        // Get current zoom level for responsive sizing
        const zoom = this.map ? this.map.getZoom() : 13;
        const baseSize = 40; // Fixed base size
        const zoomFactor = Math.max(0.6, Math.min(1.5, (zoom - 10) * 0.1 + 0.8)); // More conservative scaling
        const size = Math.round(baseSize * zoomFactor);
        
        // Fixed proportional dimensions that work well at all zoom levels
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = Math.round(8 * zoomFactor); // Smaller circle
        const arrowLength = Math.round(12 * zoomFactor); // Shorter arrow
        const strokeWidth = Math.max(2, Math.round(2.5 * zoomFactor));
        
        // Create a unified arrow shape that rotates as one piece
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <g transform="translate(${centerX}, ${centerY}) rotate(${direction})">
                    <!-- Main circle -->
                    <circle cx="0" cy="0" r="${radius}" fill="${color}" opacity="0.9" stroke="white" stroke-width="${Math.max(1, Math.round(1.5 * zoomFactor))}" />
                    <!-- Arrow pointing up (will be rotated) -->
                    <path d="M 0 ${-radius - arrowLength} L ${-arrowLength/3} ${-radius - arrowLength/2} L 0 ${-radius} L ${arrowLength/3} ${-radius - arrowLength/2} Z" 
                          fill="${color}" stroke="${color}" stroke-width="1" />
                </g>
            </svg>
        `;
        
        return L.divIcon({
            html: svg,
            className: 'custom-directional-marker',
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });
    }

    formatLastSeen(timestamp) {
        if (!timestamp) return 'Never';
        
        // Handle SQLite datetime format by treating it as UTC
        let date;
        if (timestamp.includes('T')) {
            // ISO string format
            date = new Date(timestamp);
        } else {
            // SQLite datetime format - treat as UTC
            date = new Date(timestamp + 'Z');
        }
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }

    async controlSign(signId, command) {
        console.log(`🎯 Sending command ${command} to sign ${signId}`);
        
        try {
            const response = await fetch(`/api/signs/${signId}/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: command })
            });
            
            if (response.ok) {
                console.log(`✅ Command ${command} sent to sign ${signId}`);
                // Update the popup content
                this.updateSignMarker(signId);
            } else {
                console.error(`❌ Failed to send command to sign ${signId}`);
            }
        } catch (error) {
            console.error('❌ Network error sending command:', error);
        }
    }

    updateSignMarker(signId) {
        // Update existing marker with new direction
        if (this.markers.has(signId)) {
            const sign = this.signs.get(signId);
            if (sign && sign.position_lat && sign.position_lon) {
                const actualDirection = this.calculateActualDirection(sign);
                const marker = this.markers.get(signId);
                
                // Update marker position and icon
                marker.setLatLng([sign.position_lat, sign.position_lon]);
                marker.setIcon(this.createDirectionalIcon(sign, actualDirection));
                marker.setPopupContent(this.createPopupContent(sign));
                
                console.log(`Updated marker for sign ${signId}, new direction: ${actualDirection}°`);
            }
        } else {
            // Reload signs if marker doesn't exist
            this.loadSigns();
        }
    }

    updateMarkerSizes() {
        // Update all marker sizes based on current zoom level
        console.log(`Updating marker sizes for zoom level: ${this.map.getZoom()}`);
        
        this.markers.forEach((marker, signId) => {
            const sign = this.signs.get(signId);
            if (sign) {
                const actualDirection = this.calculateActualDirection(sign);
                marker.setIcon(this.createDirectionalIcon(sign, actualDirection));
            }
        });
    }

    startRealTimeUpdates() {
        // Connect to SSE for real-time updates
        const eventSource = new EventSource('/api/signs/events');
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'sign_update' && data.sign) {
                    const sign = data.sign;
                    console.log(`Map received update for sign ${sign.id}:`, sign);
                    
                    // Update sign data
                    this.signs.set(sign.id, sign);
                    
                    // Update or add marker
                    if (sign.position_lat && sign.position_lon) {
                        if (this.markers.has(sign.id)) {
                            // Update existing marker with new direction and popup
                            const marker = this.markers.get(sign.id);
                            const actualDirection = this.calculateActualDirection(sign);
                            
                            marker.setLatLng([sign.position_lat, sign.position_lon]);
                            marker.setIcon(this.createDirectionalIcon(sign, actualDirection));
                            marker.setPopupContent(this.createPopupContent(sign));
                            
                            console.log(`Updated marker for sign ${sign.id}, direction: ${actualDirection}°`);
                        } else {
                            // Add new marker
                            this.addSignMarker(sign);
                        }
                    }
                } else if (data.type === 'command_update') {
                    // Handle command changes
                    const signId = data.signId;
                    const command = data.command;
                    console.log(`Map received command update: sign ${signId}, command ${command}`);
                    
                    if (this.signs.has(signId) && this.markers.has(signId)) {
                        const sign = this.signs.get(signId);
                        sign.current_mode = command;
                        this.signs.set(signId, sign);
                        
                        const actualDirection = this.calculateActualDirection(sign);
                        const marker = this.markers.get(signId);
                        
                        marker.setIcon(this.createDirectionalIcon(sign, actualDirection));
                        marker.setPopupContent(this.createPopupContent(sign));
                        
                        console.log(`Updated command for sign ${signId}, new direction: ${actualDirection}°`);
                    }
                }
            } catch (error) {
                console.error('Error processing SSE message:', error);
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
        };
    }
}

// Initialize map when page loads
let map;
document.addEventListener('DOMContentLoaded', () => {
    map = new SignsMap();
});
