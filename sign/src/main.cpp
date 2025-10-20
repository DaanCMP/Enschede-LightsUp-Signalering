#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Ruimzicht";
const char* password = "Vli3g3nm3pp3r";

// Server configuration
const char* serverURL = "http://10.10.50.101:3000"; // Change to your server IP
const char* signId = "1"; // Unique ID for this sign (1, 2, 3, etc.)
WiFiClient wifiClient;

// Simulated GPS and compass data
struct SignData {
  float latitude;
  float longitude;
  int heading;
  int battery;
  int signal;
};

SignData signData;

// Function declarations
void connectToWiFi();
void initializeSignData();
void updateSignData();
void registerWithServer();
void sendStatus();
void checkForCommands();

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Enschede LightsUp Sign - Test Mode");
  Serial.println("================================");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize simulated data
  initializeSignData();
  
  // No registration needed - signs are pre-configured by admin
  
  Serial.println("Setup complete. Starting main loop...");
}

void loop() {
  // Update sign data (heading, battery, signal)
  updateSignData();
  
  // Send status every 30 seconds
  if (millis() % 30000 < 100) {
    sendStatus();
  }
  
  // Check for commands every 10 seconds (includes authentication)
  if (millis() % 10000 < 100) {
    checkForCommands();
  }
  
  delay(100);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
    ESP.restart();
  }
}

void initializeSignData() {
  // Simulate GPS coordinates (Enschede area)
  signData.latitude = 52.2200 + (random(-100, 100) / 10000.0);  // ~52.22°N ± 0.01°
  signData.longitude = 6.9000 + (random(-100, 100) / 10000.0);  // ~6.90°E ± 0.01°
  
  // Simulate compass heading (0-360 degrees)
  signData.heading = random(0, 360);
  
  // Simulate battery level (70-100%)
  signData.battery = random(70, 101);
  
  // Simulate WiFi signal strength (-30 to -80 dBm)
  signData.signal = random(-80, -30);
  
  Serial.println("Simulated data initialized:");
  Serial.printf("Position: %.6f, %.6f\n", signData.latitude, signData.longitude);
  Serial.printf("Heading: %d°\n", signData.heading);
  Serial.printf("Battery: %d%%\n", signData.battery);
  Serial.printf("Signal: %d dBm\n", signData.signal);
}

void updateSignData() {
  // Update heading every 30 seconds (simulate sign rotation)
  static unsigned long lastHeadingUpdate = 0;
  if (millis() - lastHeadingUpdate >= 30000) {
    signData.heading = random(0, 360);
    lastHeadingUpdate = millis();
    Serial.printf("Heading updated to: %d°\n", signData.heading);
  }
  
  // Update battery level every 30 seconds (simulate usage)
  static unsigned long lastBatteryUpdate = 0;
  if (millis() - lastBatteryUpdate >= 30000) {
    signData.battery = random(70, 101);
    lastBatteryUpdate = millis();
    Serial.printf("Battery updated to: %d%%\n", signData.battery);
  }
  
  // Update signal strength every 30 seconds (simulate WiFi variation)
  static unsigned long lastSignalUpdate = 0;
  if (millis() - lastSignalUpdate >= 30000) {
    signData.signal = random(-80, -30);
    lastSignalUpdate = millis();
    Serial.printf("Signal updated to: %d dBm\n", signData.signal);
  }
}

// No registration needed - signs are pre-configured by admin


void sendStatus() {
  Serial.println("Sending status update...");
  
  HTTPClient http;
  http.begin(wifiClient, serverURL + String("/api/signs/") + signId + "/status");
  http.addHeader("Content-Type", "application/json");
  
  DynamicJsonDocument doc(512);
  // No authentication needed for status updates
  doc["position"][0] = signData.latitude;
  doc["position"][1] = signData.longitude;
  doc["heading"] = signData.heading;
  doc["battery"] = signData.battery;
  doc["signal"] = signData.signal;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    Serial.println("Status update successful");
  } else {
    Serial.printf("Status update failed: %d\n", httpResponseCode);
  }
  
  http.end();
}

void checkForCommands() {
  HTTPClient http;
  String commandURL = serverURL + String("/api/signs/") + signId + String("/command");
  Serial.println("Checking commands: " + commandURL);
  http.begin(wifiClient, commandURL);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    
    int command = doc["command"];
    if (command >= 0) {
      Serial.println("Received command: " + String(command));
      
      // Here you would control the LEDs based on the command
      // For now, just print the command
      if (command == 0) {
        Serial.println("→ TEST MODE (State 0)");
      } else if (command == 1) {
        Serial.println("→ Displaying LEFT ARROW (State 1)");
      } else if (command == 2) {
        Serial.println("→ Displaying RIGHT ARROW (State 2)");
      } else if (command == 3) {
        Serial.println("→ Displaying CROSS (State 3)");
      } else {
        Serial.println("→ Unknown state: " + String(command));
      }
    }
  } else {
    Serial.printf("Command check failed: %d\n", httpResponseCode);
  }
  
  http.end();
}
