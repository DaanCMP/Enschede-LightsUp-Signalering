# Enschede LightsUp Signaling - LoRa Mesh Implementation Plan

## **Project Overview**
Convert the existing ESP32 LED signaling system to a LoRa mesh network using LilyGO T-Beam boards and Meshtastic firmware for remote control and monitoring.

## **Hardware Requirements**

### **Primary Board: LilyGO T-Beam**
- **ESP32** microcontroller
- **LoRa module** (SX1276/SX1262) 
- **GPS** for positioning
- **Battery** for portable operation
- **LED strip** connection (UCS2903, 25 LEDs)
- **Range**: 1-5+ km (urban: 700m+)

### **Network Architecture**
- **Hub node**: Central control point with internet connection
- **LED nodes**: Distributed T-Beam boards at traffic locations
- **Mesh topology**: Self-healing network with multiple paths

## **Technical Specifications**

### **LoRa Configuration**
- **Data rate**: 300 bps (optimal for range)
- **Frequency**: 868 MHz (EU) or 915 MHz (US)
- **Range**: 2-5+ km open area, 1-2 km urban
- **Power**: Very low consumption, long battery life

### **Data Transmission**

#### **Control Messages (High Priority)**
- **Payload**: 2 bits (4 possible states: left, right, cross, off)
- **Transmission time**: 0.007 seconds
- **Requirement**: <5 seconds delivery
- **Frequency**: On-demand when changed

#### **Status Messages (Low Priority)**
- **GPS data**: 20 bytes (lat, lon, altitude, timestamp)
- **Battery data**: 4 bytes (voltage, percentage)
- **Transmission time**: 0.53 seconds (GPS), 0.11 seconds (battery)
- **Frequency**: Every 5-10 minutes

## **System Features**

### **Remote Control**
- **Smartphone app**: Meshtastic app for control
- **Map interface**: Click on map to change LED modes
- **Real-time control**: Change any board from anywhere
- **Status monitoring**: See which boards are online/offline

### **Automatic Features**
- **GPS positioning**: Each node reports its location
- **Battery monitoring**: Real-time battery levels
- **Mesh routing**: Self-healing network paths
- **Auto-discovery**: New nodes join automatically

## **Implementation Strategy**

### **Phase 1: Hardware Integration**
1. **T-Beam setup**: Configure LoRa, GPS, battery
2. **LED control**: Integrate existing LED code
3. **Meshtastic firmware**: Custom firmware development
4. **Testing**: Range and reliability testing

### **Phase 2: Network Deployment**
1. **Hub installation**: Central control point
2. **Node deployment**: Place T-Beam boards at locations
3. **Mesh configuration**: Network topology setup
4. **App integration**: Smartphone control interface

### **Phase 3: Volunteer Training**
1. **Setup process**: Simple power-on procedure
2. **Control training**: App usage for mode changes
3. **Maintenance**: Battery monitoring and replacement
4. **Troubleshooting**: Basic network diagnostics

## **Benefits Over Current System**

### **Operational Improvements**
- ✅ **No physical visits**: Control from anywhere
- ✅ **Real-time monitoring**: See all board status
- ✅ **Centralized control**: One person manages all
- ✅ **Reliable operation**: Self-healing mesh network
- ✅ **Easy deployment**: Volunteers just place and power on

### **Technical Advantages**
- ✅ **Long range**: 700m+ in urban areas
- ✅ **Low power**: Long battery life
- ✅ **Robust**: Works in challenging environments
- ✅ **Scalable**: Easy to add more nodes
- ✅ **Maintainable**: Remote diagnostics and updates

## **Data Flow Architecture**

```
Hub Node (Central Control)
    ↓
LoRa Mesh Network
    ↓
LED Nodes (T-Beam boards)
    ↓
LED Strips (Traffic signals)
```

## **Message Types**

### **Control Messages**
- **Source**: Hub → LED Node
- **Content**: 2 bits (mode selection)
- **Priority**: High (immediate transmission)
- **Delivery**: <5 seconds

### **Status Messages**
- **Source**: LED Node → Hub
- **Content**: GPS + Battery data
- **Priority**: Low (periodic transmission)
- **Delivery**: 5-10 minutes (acceptable delay)

## **Deployment Considerations**

### **Node Placement**
- **Elevated positions**: Better LoRa range
- **Power access**: Battery charging capability
- **Weather protection**: Enclosure for electronics
- **Antenna placement**: Clear line of sight preferred

### **Network Planning**
- **Mesh density**: Ensure multiple paths to hub
- **Range testing**: Verify 700m+ coverage
- **Battery life**: Plan for maintenance cycles
- **Backup power**: Solar or external power options

## **Next Steps**

1. **Research Meshtastic firmware**: Understand integration points
2. **T-Beam testing**: Verify LoRa range and GPS accuracy
3. **Custom firmware development**: Integrate LED control
4. **Prototype deployment**: Test with 2-3 nodes
5. **Full network rollout**: Deploy all nodes with hub

This implementation will transform the manual LED control system into a modern, remote-controlled mesh network suitable for volunteer deployment and maintenance.
