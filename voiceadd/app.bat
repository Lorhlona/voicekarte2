@echo off
start cmd /k "npm run dev"
timeout /t 15
start http://localhost:3000