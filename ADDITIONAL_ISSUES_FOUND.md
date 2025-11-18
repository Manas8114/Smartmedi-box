# Additional Issues Found - Second Review

## 🔴 Critical Issues

### 1. Missing Null Checks in Database Functions
**Files:** `backend/db.js`
**Issue:** Multiple database functions don't check if `db` is null before using it
**Impact:** High - Could cause crashes if database is not initialized
**Functions affected:**
- `getEvents()` (line 97)
- `getAllEvents()` (line 110)
- `registerUser()` (line 124)
- `getUserByUsername()` (line 137)
- `getUserByDeviceId()` (line 150)
- `insertAlert()` (line 163)
- `createTables()` (line 59)

### 2. Server Variable Declaration Order
**File:** `backend/index.js`
**Issue:** `server` variable declared after `startServer()` function but used inside it
**Impact:** Medium - Could cause issues, though JavaScript hoisting might mitigate
**Line:** 44 (declaration) vs 34 (usage)

### 3. Limit Validation Issue
**File:** `backend/api.js`
**Issue:** `parseInt(req.query.limit)` could return NaN, and `|| 100` won't catch NaN
**Impact:** Medium - Invalid limits could cause issues
**Line:** 139

### 4. MQTT Client Event Listener Leak
**File:** `backend/mqtt.js`
**Issue:** Event listeners not removed when `close()` is called, and `init()` can be called multiple times
**Impact:** High - Memory leak, duplicate event handlers
**Line:** 7-90

### 5. MQTT Close Doesn't Unsubscribe
**File:** `backend/mqtt.js`
**Issue:** `close()` doesn't unsubscribe from topics before closing
**Impact:** Medium - Orphaned subscriptions on broker
**Line:** 125-138

### 6. Duplicate MQTT Subscriptions
**File:** `web/src/services/mqttService.js`
**Issue:** Topics subscribed twice - once in connect handler (lines 42-43) and once in forEach (lines 47-57)
**Impact:** Medium - Duplicate subscriptions, unnecessary overhead
**Line:** 32-57

### 7. Notification Permission Not Requested
**File:** `web/src/components/Dashboard.jsx`
**Issue:** Notification permission is checked but never requested
**Impact:** Low - Notifications won't work until user manually grants permission
**Line:** 92

### 8. Parameter Modification in Firmware
**File:** `firmware/esp32/src/main.cpp`
**Issue:** `length` parameter is modified (line 119), which could cause issues
**Impact:** Low - Should use a local variable instead
**Line:** 118-119

## 🟡 Medium Priority Issues

### 9. Input Validation
**File:** `backend/api.js`
**Issue:** No validation for limit range (could be negative or very large)
**Impact:** Low - Performance issue with very large limits
**Line:** 139

### 10. MQTT Reconnection Race Condition
**File:** `firmware/esp32/src/wifi_mqtt.cpp`
**Issue:** If `reconnect_mqtt()` is called multiple times simultaneously, could cause issues
**Impact:** Low - Unlikely but possible

## ✅ Fixes to Apply

1. Add null checks to all database functions
2. Move server declaration before startServer function
3. Fix limit validation with proper NaN handling
4. Remove event listeners in MQTT close function
5. Prevent multiple MQTT init() calls
6. Unsubscribe from topics before closing MQTT
7. Fix duplicate subscriptions in MQTT service
8. Request notification permission on component mount
9. Use local variable instead of modifying parameter
10. Add limit range validation

