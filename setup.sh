#!/bin/bash

echo "Setting up Daily Story Bot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install Node.js to run this project."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup .env file
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your actual credentials."
else
    echo ".env file already exists."
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file and add your GEMINI_API_KEY, EMAIL_USER, EMAIL_PASS, and TO_EMAIL."
echo "2. Run 'npm start' to test the bot locally."
