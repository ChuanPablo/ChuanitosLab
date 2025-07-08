#!/bin/bash

# Get npm global prefix path
NPM_PREFIX=$(npm config get prefix)
echo "NPM global prefix (raw): $NPM_PREFIX"

# Convert Windows path to WSL path if needed
if [[ "$NPM_PREFIX" == *":"* ]]; then
    echo "Detected Windows path, converting to WSL path..."
    WSL_NPM_PREFIX=$(wslpath "$NPM_PREFIX")
    echo "Converted WSL path: $WSL_NPM_PREFIX"
    NPM_BIN_PATH="$WSL_NPM_PREFIX/bin"
else
    NPM_BIN_PATH="$NPM_PREFIX/bin"
fi

echo "NPM bin path: $NPM_BIN_PATH"
echo "Current PATH: $PATH"
echo ""

# Check if npm bin path is in PATH
if [[ ":$PATH:" == *":$NPM_BIN_PATH:"* ]]; then
    echo "✅ SUCCESS: npm bin path is in your PATH"
    echo "Global npm packages should be accessible"
else
    echo "❌ NOT FOUND: npm bin path is NOT in your PATH"
    echo ""
    echo "To fix this, run:"
    echo "echo 'export PATH=\"$NPM_BIN_PATH:\$PATH\"' >> ~/.bashrc"
    echo "source ~/.bashrc"
    echo ""
    echo "Or for zsh:"
    echo "echo 'export PATH=\"$NPM_BIN_PATH:\$PATH\"' >> ~/.zshrc"
    echo "source ~/.zshrc"
fi

echo ""
echo "Testing nx command availability:"
if command -v nx &> /dev/null; then
    echo "✅ nx command is available"
    echo "nx version: $(nx --version 2>/dev/null || echo 'version check failed')"
else
    echo "❌ nx command not found"
    echo "Try: npm install -g nx"
fi
