# Enschede LightsUp Signaling - Implementation Plan

## **Project Scope & Future-Proofing**

### **Current Phase: WiFi Implementation**
- **Hardware**: ESP32 (Lolin D32 Pro) + GPS + Compass
- **Network**: WiFi connectivity to central server
- **Control**: Web-based interface with OTA updates
- **Animation**: Custom LED patterns per sign

### **Future Phase: LoRa Mesh**
- **Hardware**: LilyGO T-Beam (LoRa + GPS + Battery)
- **Network**: Self-healing mesh network
- **Control**: Remote control via mesh
- **Animation**: Same OTA system, different transport

## **Hardware Configuration**

### **Current ESP32 Setup**
```
ESP32 (Lolin D32 Pro)
├── GPS Module (Neo-6M/7M/8M)
├── Compass Module (HMC5883L/QMC5883L)
├── LED Strip (UCS2903, 25 LEDs)
└── WiFi Connection
```

### **Future T-Beam Setup**
```
LilyGO T-Beam
├── Built-in GPS
├── Built-in LoRa
├── LED Strip (UCS2903, 25 LEDs)
└── Battery Power
```

## **OTA Animation System**

### **Concept: Generic Controllers, Custom Animations**
- **Generic ESP32 firmware** - Same code for all signs
- **Custom animations** - Uploaded per sign via OTA
- **Animation library** - Pre-built patterns for different sign types
- **Dynamic loading** - Load animations from server

### **Animation Types**
```cpp
// Animation structure
struct Animation {
  String name;           // "left_arrow", "right_arrow", "cross"
  int duration;          // Total animation time (ms)
  int steps;            // Number of animation steps
  LEDStep* steps;       // Array of LED states
};

struct LEDStep {
  int delay;            // Time to hold this step (ms)
  CRGB* colors;         // Color for each LED
  int brightness;       // Overall brightness
};
```

### **OTA Implementation**
```cpp
// ESP32 checks for new animations
void checkForUpdates() {
  HTTPClient http;
  http.begin(serverURL + "/animations/" + signID);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String animationData = http.getString();
    // Parse and load new animation
    loadAnimation(animationData);
  }
}
```

## **Implementation Phases**

### **Phase 1: Basic WiFi + Compass (Current)**
1. **ESP32 WiFi setup** - Connect to network
2. **Compass integration** - HMC5883L/QMC5883L
3. **GPS integration** - Neo-6M/7M/8M
4. **Basic LED control** - Existing patterns
5. **Web server** - Local control interface

### **Phase 2: OTA Animation System**
1. **Animation framework** - Generic animation loader
2. **OTA updates** - Download animations from server
3. **Animation library** - Pre-built patterns
4. **Dynamic loading** - Load animations per sign
5. **Server integration** - Central animation management

### **Phase 3: Central Server**
1. **Node.js/Python server** - Central control
2. **Database** - Sign positions, animations, status
3. **Web interface** - Control dashboard
4. **Real-time monitoring** - Status and battery
5. **Animation management** - Upload/assign animations

### **Phase 4: Future LoRa Mesh**
1. **T-Beam integration** - LoRa + GPS + Battery
2. **Mesh networking** - Self-healing network
3. **Same OTA system** - Animation updates via mesh
4. **Battery optimization** - Power management
5. **Remote deployment** - No WiFi needed

## **Animation System Architecture**

### **Server Side**
```
Central Server
├── Animation Library
│   ├── left_arrow.json
│   ├── right_arrow.json
│   ├── cross.json
│   └── custom_patterns/
├── Sign Database
│   ├── sign_id
│   ├── position (GPS)
│   ├── heading (compass)
│   ├── current_animation
│   └── status
└── Web Interface
    ├── Map view
    ├── Animation selector
    └── Status monitoring
```

### **ESP32 Side**
```
ESP32 Firmware
├── WiFi Manager
├── Compass/GPS
├── Animation Engine
│   ├── Load animations
│   ├── Execute patterns
│   └── OTA updates
├── LED Control
└── Web Server
```

## **Benefits of This Approach**

### **Current Phase**
- ✅ **Use existing hardware** - No new boards needed
- ✅ **WiFi connectivity** - Remote control and monitoring
- ✅ **Compass integration** - Automatic directional awareness
- ✅ **OTA updates** - Upload new animations remotely
- ✅ **Generic controllers** - Same firmware for all signs

### **Future Phase**
- ✅ **LoRa mesh** - Long-range, battery-powered
- ✅ **Same animation system** - OTA works with mesh
- ✅ **Scalable** - Easy to add more signs
- ✅ **Maintainable** - Central animation management
- ✅ **Future-proof** - Ready for T-Beam upgrade

## **Technical Implementation**

### **Animation Format (JSON)**
```json
{
  "name": "left_arrow",
  "duration": 2000,
  "steps": [
    {
      "delay": 300,
      "leds": [24, 23, 22, 21, 20, 11, 2, 8, 17, 19],
      "color": [255, 191, 127],
      "brightness": 40
    }
  ]
}
```

### **OTA Update Process**
1. **ESP32 checks server** - Request new animations
2. **Server responds** - Send animation data
3. **ESP32 downloads** - Store animation in memory/SPIFFS
4. **ESP32 loads** - Execute new animation
5. **Status update** - Report success/failure to server

## **Next Steps**

1. **Implement basic WiFi** - ESP32 connectivity
2. **Add compass/GPS** - Hardware integration
3. **Create animation framework** - Generic animation loader
4. **Build OTA system** - Download animations from server
5. **Develop central server** - Web interface and management

This approach gives you a future-proof system that works with current hardware while being ready for the LoRa mesh upgrade!
