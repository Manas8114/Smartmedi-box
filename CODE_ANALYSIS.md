# Code Analysis - Logic Errors and Memory Leaks

## 🔴 Critical Issues

### Backend (Node.js)

#### 1. Database Connection Memory Leak
**File:** `backend/db.js`
**Issue:** Database connection is never closed, causing memory leaks on process restart
**Line:** No cleanup function
**Impact:** High - Memory leak on server restart

#### 2. Arrow Function Context Issue
**File:** `backend/db.js`
**Issue:** `this.lastID` used in arrow functions (lines 79, 85) - `this` is not bound correctly
**Impact:** Medium - May cause incorrect ID returns

#### 3. MQTT Client Not Cleaned Up
**File:** `backend/mqtt.js`
**Issue:** No graceful shutdown - MQTT client never properly closed
**Impact:** High - Resource leak, connections not released

#### 4. No Graceful Shutdown Handler
**File:** `backend/index.js`
**Issue:** No SIGTERM/SIGINT handlers to close DB and MQTT connections
**Impact:** High - Data corruption risk, resource leaks

#### 5. Unhandled Promise Rejections
**File:** `backend/mqtt.js` (line 37-59)
**Issue:** Async message handler has no error handling for database operations
**Impact:** Medium - Unhandled errors could crash process

#### 6. JSON Parsing Without Validation
**File:** `backend/mqtt.js` (line 39)
**Issue:** `JSON.parse` can throw on malformed JSON, crashing the handler
**Impact:** Medium - Process crash risk

#### 7. Stats Calculation Inefficiency
**File:** `backend/api.js` (line 176-184)
**Issue:** Fetches 1000 events and filters in memory instead of using SQL
**Impact:** Low - Performance issue with large datasets

### Frontend (React)

#### 8. useEffect Dependency Issues
**File:** `web/src/components/Dashboard.jsx`
**Issue:** `setupMQTT` recreated on every render, causing MQTT reconnections
**Impact:** High - Memory leak, multiple connections

#### 9. MQTT Callbacks Not Cleaned Up
**File:** `web/src/components/Dashboard.jsx`
**Issue:** Callbacks registered but not removed when user changes or component unmounts
**Impact:** High - Memory leak, duplicate event handlers

#### 10. Race Condition in Stats Loading
**File:** `web/src/components/Dashboard.jsx` (line 78)
**Issue:** `loadStats()` called in MQTT callback without await, can cause race conditions
**Impact:** Medium - State inconsistencies

#### 11. MQTT Service Connection Logic
**File:** `web/src/services/mqttService.js`
**Issue:** `disconnect()` doesn't unsubscribe from topics before clearing subscriptions
**Impact:** Medium - Orphaned subscriptions on broker

#### 12. Multiple Connection Prevention
**File:** `web/src/services/mqttService.js` (line 11-14)
**Issue:** Check for connection but doesn't prevent duplicate connections properly
**Impact:** Medium - Multiple connections possible

#### 13. Chart.js Memory Leak
**File:** `web/src/components/RealTimeChart.jsx`
**Issue:** Chart instance not destroyed on unmount
**Impact:** Low - Minor memory leak

### Firmware (ESP32)

#### 14. Buffer Overflow Risk
**File:** `firmware/esp32/src/main.cpp` (line 94)
**Issue:** `jsonBuffer[200]` may overflow if JSON is larger than 200 bytes
**Impact:** High - Buffer overflow, crash

#### 15. String Concatenation in Callback
**File:** `firmware/esp32/src/main.cpp` (line 111-114)
**Issue:** String concatenation in interrupt handler can cause memory issues
**Impact:** Medium - Memory fragmentation

#### 16. Infinite Reconnect Loop
**File:** `firmware/esp32/src/wifi_mqtt.cpp` (line 37)
**Issue:** `while` loop can block indefinitely if MQTT broker is down
**Impact:** High - Watchdog timeout, system freeze

#### 17. millis() Overflow
**File:** `firmware/esp32/src/main.cpp` (line 92)
**Issue:** `millis()` overflows after ~49 days, causing timestamp issues
**Impact:** Low - Long-term issue

#### 18. Static Variables Not Thread-Safe
**File:** `firmware/esp32/src/sensors.cpp` (line 18-19, 29)
**Issue:** Static variables accessed from multiple contexts
**Impact:** Low - Potential race condition (though ESP32 is single-threaded)

## 🟡 Medium Priority Issues

### Backend
- No input validation on device_id in API endpoints
- No rate limiting on MQTT message processing
- SQL injection risk (mitigated by parameterized queries, but should verify)

### Frontend
- No error boundaries for React components
- Chart data arrays grow unbounded (though sliced to 20)
- Alert using `alert()` is blocking

### Firmware
- No watchdog reset in long operations
- WiFi reconnection not handled
- Sensor calibration happens in init, may fail silently

## 🟢 Low Priority Issues

- Missing JSDoc comments
- No unit tests
- Hardcoded configuration values
- No logging levels
- No metrics/monitoring

## 📋 Recommendations

1. **Implement graceful shutdown** for backend
2. **Fix arrow function context** in database operations
3. **Add proper cleanup** for MQTT connections
4. **Fix useEffect dependencies** in React components
5. **Add buffer size checks** in firmware
6. **Implement reconnection limits** in firmware
7. **Add error boundaries** in React
8. **Optimize database queries** for stats
9. **Add input validation** throughout
10. **Implement proper logging** with levels

