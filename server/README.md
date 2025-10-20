# Enschede LightsUp Server

Node.js server for managing LED traffic signs with WiFi connectivity.

## **Architecture**

- **Backend**: Node.js + Express
- **Database**: SQLite
- **Security**: Individual sign keys
- **Deployment**: Self-hosted (Docker for cloud migration)

## **Features**

- **Sign Management**: Register and track ESP32 signs
- **Real-time Status**: GPS position, compass heading, battery level
- **Remote Control**: Change LED modes via web interface
- **Security**: Individual keys per sign
- **Web Interface**: Control dashboard for volunteers

## **API Endpoints**

### **Sign Registration**
```
POST /api/signs/register
{
  "signId": "SIGN_001",
  "key": "secret-key-abc123",
  "position": [52.123, 6.123],
  "heading": 45
}
```

### **Status Updates**
```
POST /api/signs/:id/status
{
  "key": "secret-key-abc123",
  "position": [52.123, 6.123],
  "heading": 45,
  "battery": 85,
  "signal": -45
}
```

### **Control Commands**
```
POST /api/signs/:id/control
{
  "key": "secret-key-abc123",
  "command": "left_arrow"
}
```

### **Get All Signs**
```
GET /api/signs
```

## **Database Schema**

```sql
CREATE TABLE signs (
  id TEXT PRIMARY KEY,
  name TEXT,
  key TEXT,
  position_lat REAL,
  position_lon REAL,
  heading INTEGER,
  status TEXT,
  battery INTEGER,
  signal INTEGER,
  last_seen TIMESTAMP,
  current_mode TEXT
);
```

## **Security**

- **GPS Time + PSK**: ESP32 sends GPS timestamp + PSK hash
- **Time validation**: Server checks timestamp is recent (5 minutes)
- **PSK per ESP32**: Each sign has unique pre-shared key
- **Basic auth**: Web interface authentication
- **Rate limiting**: API abuse protection

### **Authentication Flow**
```
ESP32 Request:
{
  "signId": "SIGN_001",
  "gpsTime": 1703123456,
  "hash": "sha256(psk + gpsTime + data)"
}
```

### **Server Validation**
1. Check GPS time is recent (within 5 minutes)
2. Verify hash = sha256(psk + gpsTime + data)
3. Reject if time is old or hash doesn't match

## **Deployment**

### **Development**
```bash
npm install
npm start
```

### **Production**
```bash
# Using PM2
pm2 start app.js
pm2 startup
pm2 save
```

### **Docker (Cloud)**
```bash
docker build -t enschede-server .
docker run -p 3000:3000 enschede-server
```

## **Next Steps**

1. **Basic server** - Express + SQLite setup
2. **Sign registration** - ESP32 connection
3. **Web interface** - Control dashboard
4. **Testing** - ESP32 integration
