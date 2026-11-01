#!/usr/bin/env bash
# ==============================================================================
# Apex Quantum & Cyber Defense Suite - Setup & Environment Initializer Script
# Repository: piyyy314/Apex Quantum & Cyber Defense Suite
# ==============================================================================

set -e

echo "======================================================================"
echo "🛡️ ⚛️  Apex Quantum & Cyber Defense Suite Initializer"
echo "Repository: piyyy314/Apex Quantum & Cyber Defense Suite"
echo "======================================================================"

# Step 1: Verify Python 3 Installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 could not be found. Please install Python 3.10+."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "✅ Detected Python version: $PYTHON_VERSION"

# Step 2: Create Python Virtual Environment (.venv)
VENV_DIR=".venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating Python virtual environment in $VENV_DIR..."
    python3 -m venv "$VENV_DIR"
else
    echo "ℹ️  Virtual environment $VENV_DIR already exists."
fi

# Step 3: Activate Virtual Environment
echo "🔄 Activating virtual environment..."
# shellcheck source=/dev/null
source "$VENV_DIR/bin/activate"

# Step 4: Upgrade pip & Install Core Python Dependencies
echo "⚡ Upgrading pip and installing required Python packages..."
pip install --upgrade pip

# Install rich, numpy, scipy, and core quantum/sim packages
pip install rich numpy scipy

echo "✅ Python environment successfully configured with: rich, numpy, scipy"

# Step 5: Verify Node.js & npm for Web UI & Express Engine
if command -v npm &> /dev/null; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    echo "✅ Node.js dependencies installed successfully."
else
    echo "⚠️  npm not found. Please install Node.js (v20+) to run the web interface."
fi

# Step 6: Environment File Setup
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
fi

echo "======================================================================"
echo "🎉 Setup Complete!"
echo ""
echo "To activate the virtual environment manually, run:"
echo "   source .venv/bin/activate"
echo ""
echo "To launch the Apex Quantum Web & API Suite:"
echo "   npm run dev"
echo "======================================================================"
