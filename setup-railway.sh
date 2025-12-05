#!/bin/bash

# Quick Railway + Neon Deployment Setup Script
# Usage: bash setup-railway.sh

set -e

echo "🚀 SiliHealth - Railway + Neon Deployment Setup"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it from: https://railway.app"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI found${NC}"

# Prompt for backend project setup
echo ""
echo -e "${YELLOW}📋 BACKEND SETUP (Railway Project A)${NC}"
echo "1. Go to https://railway.app and create a new project"
echo "2. Connect your GitHub repository (SiliHealth)"
echo "3. Select backend folder"
echo ""
read -p "Have you created the backend Railway project? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the backend project first."
    exit 1
fi

# Get backend project ID
read -p "Enter your Backend Railway Project ID: " BACKEND_PROJECT_ID
echo ""

# Set backend environment variables
echo -e "${YELLOW}Setting Backend Environment Variables...${NC}"
railway project --id=$BACKEND_PROJECT_ID

echo "Enter your Neon DATABASE_URL (paste the full URL):"
read DATABASE_URL

echo "Enter your JWT_SECRET (min 32 characters):"
read JWT_SECRET

echo "Enter your Frontend Railway URL (you'll get it after deploying frontend):"
read FRONTEND_URL

# Deploy backend variables
railway variable set DATABASE_URL="$DATABASE_URL" --project=$BACKEND_PROJECT_ID
railway variable set JWT_SECRET="$JWT_SECRET" --project=$BACKEND_PROJECT_ID
railway variable set NODE_ENV="production" --project=$BACKEND_PROJECT_ID
railway variable set FRONTEND_URL="$FRONTEND_URL" --project=$BACKEND_PROJECT_ID

echo -e "${GREEN}✓ Backend variables configured${NC}"
echo ""

# Frontend setup
echo -e "${YELLOW}📋 FRONTEND SETUP (Railway Project B)${NC}"
echo "1. Go to https://railway.app and create a new project"
echo "2. Connect your GitHub repository (SiliHealth)"
echo "3. Select frontend folder"
echo ""
read -p "Have you created the frontend Railway project? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the frontend project first."
    exit 1
fi

# Get frontend project ID
read -p "Enter your Frontend Railway Project ID: " FRONTEND_PROJECT_ID
echo ""

# Set frontend environment variables
echo -e "${YELLOW}Setting Frontend Environment Variables...${NC}"
railway project --id=$FRONTEND_PROJECT_ID

echo "Enter your Backend Railway URL (e.g., https://backend-production-xxxx.railway.app):"
read BACKEND_URL

# Deploy frontend variables
railway variable set BACKEND_URL="$BACKEND_URL" --project=$FRONTEND_PROJECT_ID
railway variable set NODE_ENV="production" --project=$FRONTEND_PROJECT_ID

echo -e "${GREEN}✓ Frontend variables configured${NC}"
echo ""

# Final steps
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Railway will automatically build and deploy from your GitHub pushes"
echo "2. Check deployment status at: https://railway.app"
echo "3. Backend logs: railway logs --project-id=$BACKEND_PROJECT_ID"
echo "4. Frontend logs: railway logs --project-id=$FRONTEND_PROJECT_ID"
echo ""
echo "Your application will be available at:"
echo "- Frontend: https://frontend-production-xxxx.railway.app"
echo "- Backend: https://backend-production-xxxx.railway.app"
