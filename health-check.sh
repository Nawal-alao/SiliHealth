#!/bin/bash

# Health Check Script for Railway Deployment
# Usage: bash health-check.sh <backend-url> <frontend-url>

BACKEND_URL="${1:-http://localhost:4000}"
FRONTEND_URL="${2:-http://localhost:3000}"

echo "🏥 SiliHealth Deployment Health Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Backend
echo -e "${YELLOW}Checking Backend: $BACKEND_URL${NC}"
if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    echo "  Make sure the backend is running and the URL is correct"
fi

echo ""

# Check Backend Health Endpoint
echo -e "${YELLOW}Checking Backend Health Endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health" 2>/dev/null || echo "ERROR")
if [[ $HEALTH_RESPONSE != "ERROR" ]]; then
    echo -e "${GREEN}✓ Backend health endpoint: $HEALTH_RESPONSE${NC}"
else
    echo -e "${RED}✗ Backend health endpoint not available${NC}"
fi

echo ""

# Check Frontend
echo -e "${YELLOW}Checking Frontend: $FRONTEND_URL${NC}"
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    echo "  Make sure the frontend is running and the URL is correct"
fi

echo ""

# Check Frontend Config Endpoint
echo -e "${YELLOW}Checking Frontend Config Endpoint...${NC}"
CONFIG_RESPONSE=$(curl -s "$FRONTEND_URL/api/config" 2>/dev/null)
if [[ ! -z $CONFIG_RESPONSE ]]; then
    echo -e "${GREEN}✓ Frontend config endpoint responding:${NC}"
    echo "  $CONFIG_RESPONSE"
else
    echo -e "${RED}✗ Frontend config endpoint not available${NC}"
fi

echo ""

# Check Connectivity (Frontend → Backend)
echo -e "${YELLOW}Checking Frontend → Backend Connectivity...${NC}"
if curl -s "$FRONTEND_URL/api/config" | grep -q "$BACKEND_URL"; then
    echo -e "${GREEN}✓ Frontend is correctly configured to reach backend${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may not be configured with the correct backend URL${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}Health check complete!${NC}"
