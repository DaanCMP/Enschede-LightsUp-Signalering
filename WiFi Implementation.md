# Enschede LightsUp Signaling - WiFi Implementation Plan

## **Project Overview**
Convert the existing ESP32 LED signaling system to a WiFi-based network for remote control and monitoring using the current hardware.

## **Hardware Requirements**

### **Current Hardware (No Changes Needed)**
- **ESP32** (Lolin D32 Pro) - already has WiFi
- **LED strips** (UCS2903, 25 LEDs)
- **Power supply** (existing setup)
- **Range**: WiFi coverage area (typically 50-100m per access point)

### **Network Architecture**
- **WiFi Access Point**: Central router for network
- **LED nodes**: ESP32 boards with WiFi
- **Control interface**: Web-based or smartphone app
- **Hub**: Central server for coordination

## **Technical Specifications**

### **WiFi Configuration**
- **Protocol**: WiFi 802.11n (ESP32 standard)
- **Range**: 50-100m per access point
- **Data rate**: 1-54 Mbps (much faster than LoRa)
- **Power**: Higher consumption than LoRa, but manageable

### **Data Transmission**

#### **Control Messages (High Priority)**
- **Payload**: 2 bits (4 possible states: left, right, cross, off)
- **Transmission time**: <1 second
- **Requirement**: <5 seconds delivery ✅
- **Frequency**: On-demand when changed

#### **Status Messages (Low Priority)**
- **GPS data**: 20 bytes (if GPS module added)
- **Battery data**: 4 bytes (voltage, percentage)
- **WiFi signal**: 4 bytes (RSSI, connection quality)
- **Transmission time**: <1 second
- **Frequency**: Every 5-10 minutes

## **System Features**

### **Remote Control**
- **Web interface**: Browser-based control panel
- **Smartphone app**: Simple web app for mobile
- **Real-time control**: Change any board from anywhere
- **Status monitoring**: See which boards are online/offline

### **Automatic Features**
- **Auto-connection**: ESP32s connect to WiFi automatically
- **Status reporting**: Battery, signal strength, LED status
- **Network discovery**: Automatic node detection
- **Failsafe operation**: Continue working if network fails

## **Implementation Strategy**

### **Phase 1: WiFi Integration**
1. **ESP32 WiFi setup**: Connect to existing network
2. **Web server**: Add HTTP server to each ESP32
3. **LED control**: Integrate existing LED code
4. **Testing**: Network connectivity and control

### **Phase 2: Control Interface**
1. **Web interface**: Simple HTML control panel
2. **Mobile optimization**: Responsive design for phones
3. **Status dashboard**: Real-time monitoring
4. **Central hub**: Optional server for coordination

### **Phase 3: Deployment**
1. **Network setup**: WiFi access point configuration
2. **Node deployment**: Place ESP32 boards at locations
3. **Testing**: Verify control and monitoring
4. **Training**: Volunteer training for control interface

## **Benefits Over Current System**

### **Operational Improvements**
- ✅ **No physical visits**: Control from anywhere on network
- ✅ **Real-time monitoring**: See all board status
- ✅ **Centralized control**: One person manages all
- ✅ **Easy deployment**: Use existing hardware
- ✅ **Quick implementation**: No new hardware needed

### **Technical Advantages**
- ✅ **Fast communication**: WiFi is much faster than LoRa
- ✅ **Reliable**: Standard WiFi protocols
- ✅ **Easy setup**: Standard network configuration
- ✅ **Scalable**: Easy to add more nodes
- ✅ **Maintainable**: Standard web technologies

## **Data Flow Architecture**

```
WiFi Access Point
    ↓
WiFi Network
    ↓
ESP32 Nodes (LED boards)
    ↓
LED Strips (Traffic signals)
```

## **Message Types**

### **Control Messages**
- **Source**: Web interface → ESP32 Node
- **Content**: 2 bits (mode selection)
- **Priority**: High (immediate transmission)
- **Delivery**: <1 second

### **Status Messages**
- **Source**: ESP32 Node → Web interface
- **Content**: Battery + WiFi signal data
- **Priority**: Low (periodic transmission)
- **Delivery**: <1 second

## **Implementation Options**

### **Option 1: Direct Web Interface**
- Each ESP32 runs a web server
- Access directly via IP address
- Simple HTML interface
- **Pros**: Simple, no central server needed
- **Cons**: Need to know IP addresses

### **Option 2: Central Hub Server**
- Central server coordinates all nodes
- Single web interface for all boards
- ESP32s report to central server
- **Pros**: Unified interface, easier management
- **Cons**: Need central server

### **Option 3: Hybrid Approach**
- ESP32s run web servers
- Central discovery server
- Best of both worlds
- **Pros**: Flexible, scalable
- **Cons**: More complex setup

## **Deployment Considerations**

### **Network Requirements**
- **WiFi coverage**: Ensure all locations have signal
- **Access point placement**: Strategic positioning for coverage
- **Network security**: WPA2/WPA3 encryption
- **Bandwidth**: Minimal requirements (LED control is lightweight)

### **Node Placement**
- **WiFi signal strength**: Ensure good connection
- **Power access**: Existing power setup
- **Weather protection**: Existing enclosures
- **Antenna placement**: ESP32 internal antenna sufficient

## **Next Steps**

1. **WiFi integration**: Add WiFi connectivity to existing code
2. **Web server**: Implement HTTP server on ESP32
3. **Control interface**: Create simple web interface
4. **Testing**: Verify network control and monitoring
5. **Deployment**: Roll out to all locations

This WiFi implementation provides immediate remote control capabilities using your existing hardware, with much faster development time than the LoRa mesh solution.

