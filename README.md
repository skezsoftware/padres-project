# MLB Pitching Analytics Hub

A web application for analyzing MLB pitching statistics and key performance indicators, focusing on the San Diego Padres' July 2024 games.

## Prerequisites Installation

Before starting, you'll need to install:

1. Node.js and npm:
   - Download and install from: https://nodejs.org/
   - This will install both Node.js and npm
   - After installation, verify with:
     node --version
     npm --version

2. Python and pip:
   - Download and install from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation
   - After installation, verify with:
     python --version
     pip --version

## Getting Started

1. Clone the repository (choose one option):

HTTPS:
git clone https://github.com/skezsoftware/padres-project.git

cd padres-project

SSH:
git clone git@github.com:skezsoftware/padres-project.git

cd padres-project


## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
cd frontend

2. Install dependencies:
npm install

3. Start the development server:
npm run dev

The frontend will run on http://localhost:5173

### Backend Setup

1. Navigate to the backend directory:
cd backend

2. Create and activate a virtual environment:

Windows:
python -m venv venv
.\venv\Scripts\activate

macOS/Linux:
python3 -m venv venv
source venv/bin/activate

3. Install required Python packages:
pip install -r requirements.txt

4. Start the backend server:
uvicorn app.main:app --reload

The backend API will run on http://localhost:8000

## Accessing the Application

1. Open your web browser and navigate to http://localhost:5173
2. You'll see the team grid with the Padres centered
3. Click on any team to view their pitching analytics:
   - Select Padres to see their pitching staff performance
   - Select other teams to see how their pitchers performed against Padres hitters

## Features
- Comprehensive pitching statistics
- Interactive heat maps
- Pitcher leaderboards
- Key performance indicators including:
  - Strikeout percentage
  - Walk percentage
  - First pitch strike percentage
  - Fielding Independent Pitching (FIP)
  - Pitch-specific metrics

## Project Structure

project-root/
├── frontend/          # React frontend application
│   ├── public/        
│   │   └── assets/    # Team logo images (included in repository)
│   └── src/           # React source code
└── backend/           # FastAPI backend application
    ├── app/           # API implementation
    └── requirements.txt # Python dependencies

## Troubleshooting

If you encounter any issues:

1. Ensure both frontend and backend servers are running
2. Verify that ports 5173 and 8000 are available on your system
3. Make sure all dependencies are properly installed
4. Common solutions:
   - If npm install fails, try deleting node_modules folder and package-lock.json, then run npm install again
   - If Python packages fail to install, ensure you're using Python 3.8 or higher
   - If ports are in use, you may need to kill existing processes or use different ports

## Common Commands

Frontend:
- npm install    # Install dependencies
- npm run dev    # Start development server
- npm run build  # Build for production

Backend:
- pip install -r requirements.txt  # Install Python dependencies
- uvicorn app.main:app --reload   # Start development server



