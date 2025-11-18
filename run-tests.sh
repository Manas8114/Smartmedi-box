#!/bin/bash

# Script to run all tests for MediMind Pro

echo "========================================"
echo "  MediMind Pro - Test Suite"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_result() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}Tests failed!${NC}"
        exit 1
    fi
}

echo "[1/2] Running Backend Tests..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
npm test
check_result
cd ..

echo ""
echo "[2/2] Running Frontend Tests..."
cd web
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm test -- --watchAll=false --coverage
check_result
cd ..

echo ""
echo -e "${GREEN}========================================"
echo "  All tests passed!"
echo "========================================${NC}"

