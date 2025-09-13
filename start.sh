#!/bin/bash

echo "Starting TelMed Application..."

echo ""
echo "Starting Server..."
gnome-terminal -- bash -c "cd server && npm run dev; exec bash" 2>/dev/null || xterm -e "cd server && npm run dev" 2>/dev/null || osascript -e 'tell app "Terminal" to do script "cd server && npm run dev"' 2>/dev/null &

echo ""
echo "Waiting 5 seconds for server to start..."
sleep 5

echo ""
echo "Starting Client..."
gnome-terminal -- bash -c "cd client && npm run dev; exec bash" 2>/dev/null || xterm -e "cd client && npm run dev" 2>/dev/null || osascript -e 'tell app "Terminal" to do script "cd client && npm run dev"' 2>/dev/null &

echo ""
echo "Both server and client are starting..."
echo "Server will be available at: http://localhost:4000"
echo "Client will be available at: http://localhost:5173"
echo ""
echo "Press any key to exit..."
read -n 1
