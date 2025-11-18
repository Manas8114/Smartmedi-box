#!/bin/bash

# Script to start all services on Linux/Mac

echo "========================================"
echo "  MediMind Pro - Starting Services"
echo "========================================"
echo ""

# Check if Mosquitto is installed
if ! command -v mosquitto &> /dev/null; then
    echo "[ERROR] Mosquitto not found. Please install Mosquitto first."
    echo "Ubuntu/Debian: sudo apt-get install mosquitto"
    echo "Mac: brew install mosquitto"
    exit 1
fi

echo "[1/3] Starting MQTT Broker..."
mosquitto -v &
MOSQUITTO_PID=$!
sleep 2

echo "[2/3] Starting Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
npm start &
BACKEND_PID=$!
cd ..
sleep 3

echo "[3/3] Starting Frontend..."
cd web
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  Services Started!"
echo "========================================"
echo ""
echo "- MQTT Broker: running on port 1883 (PID: $MOSQUITTO_PID)"
echo "- Backend: http://localhost:3000 (PID: $BACKEND_PID)"
echo "- Frontend: http://localhost:3000 (React default port) (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to clean up processes on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $MOSQUITTO_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Wait indefinitely
wait

