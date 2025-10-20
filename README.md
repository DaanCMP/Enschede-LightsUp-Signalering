# Enschede LightsUp Signaling - WiFi Implementation

WiFi-based LED signaling system for traffic control with remote monitoring and compass integration.

## Project Structure

```
├── sign/                    # ESP32 firmware for LED signs
├── server/                  # Central server (Node.js/Python)
├── docs/                    # Documentation
│   ├── WiFi Implementation.md
│   └── LoRa Mesh.md
├── legacy/                  # Original ESP32 code
│   ├── src/
│   ├── platformio.ini
│   └── test/
└── platformio.ini          # Current ESP32 configuration
```

## Components

### LED Signs (`sign/`)
- ESP32 firmware with WiFi connectivity
- Compass integration (HMC5883L/QMC5883L)
- LED control (UCS2903 strips)
- Web server for local control
- Central server communication

### Central Server (`server/`)
- Node.js or Python server
- Web interface for control
- Database for sign positions and status
- Real-time monitoring dashboard

### Documentation (`docs/`)
- WiFi Implementation plan
- LoRa Mesh future plan
- Setup and deployment guides

## Features

- ✅ **WiFi connectivity** - ESP32s connect to network
- ✅ **Compass integration** - Automatic directional awareness
- ✅ **Remote control** - Web-based control interface
- ✅ **Real-time monitoring** - Status and battery monitoring
- ✅ **Centralized management** - Single server controls all signs

## Quick Start

1. **ESP32 Setup**: Configure WiFi and compass
2. **Server Setup**: Deploy central server
3. **Network Configuration**: Ensure WiFi coverage
4. **Deployment**: Place signs and configure

## Legacy Code

The original ESP32 code is preserved in the `legacy/` folder for reference or standalone projects that don't need WiFi connectivity.

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.