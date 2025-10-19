# Enschede LightsUp Signaling

Software to control the Enschede Lights Up signaling system with LED strips for traffic control.

## Overview

This project contains firmware for an ESP32-based LED signaling system used for traffic control in Enschede. The system can display different signals:

- **Left Arrow** - Indicate left turn direction
- **Right Arrow** - Indicate right turn direction  
- **Cross** - Stop/prohibition signal

## Hardware

- **Microcontroller**: ESP32 (Lolin D32 Pro)
- **LED Strip**: UCS2903 LED strips
- **Number of LEDs**: 25 LEDs
- **Data Pin**: GPIO 4

## LED Layout

```
  ___________________________________
  [9] [10] [11] [12] [13] [14] [15]
  ▔▔\      \▔▔▔▔▔ /      /▔▔
       \ [08] \        / [16] /
  ______\      \______/      /_______
  [18] [19] [20] [21] [22] [23] [24]
   ▔▔▔/      /▔▔▔\      \▔▔▔▔
       / [17] /        \ [07] \
  ____/      /__________\      \_____
  [00] [01] [02] [03] [04] [05] [06]
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
```

## Installation

### Requirements

- [PlatformIO](https://platformio.org/) installed
- ESP32 board (Lolin D32 Pro)
- UCS2903 LED strip

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/username/Enschede-LightsUp-Signalering.git
   cd Enschede-LightsUp-Signalering
   ```

2. Open the project in PlatformIO:
   ```bash
   pio project init
   ```

3. Upload to ESP32:
   ```bash
   pio run --target upload
   ```

## Configuration

In `src/main.cpp` you can adjust the following settings:

- `DATA_PIN`: GPIO pin for LED data (default: 4)
- `LEDBRIGHTNESS`: Brightness 0-100 (default: 40)
- `NUM_LEDS`: Number of LEDs (default: 25)

### Signal Types

Choose one of the following options by activating the appropriate define:

```cpp
#define CROSS        // Cross signal
#define ARROWLEFT    // Left arrow
#define ARROWRIGHT   // Right arrow
```

## Usage

After uploading, the system automatically starts with a boot sequence that tests all LEDs. Then the selected signal begins animating according to the configured timing.

## Timing Settings

- `arrowInAnimationTime`: Arrow in-animation time (ms)
- `arrowOutAnimationTime`: Arrow out-animation time (ms)  
- `crossInAnimationTime`: Cross in-animation time (ms)
- `crossOutAnimationTime`: Cross out-animation time (ms)
- `offTime`: Time the signal stays off (ms)
- `onTime`: Time the signal stays on (ms)

## License

This project is released under Apache License 2.0. See [LICENSE](LICENSE) for details.

## Author

Daniël Vegter - Enschede Lights Up Signaling V0.9
