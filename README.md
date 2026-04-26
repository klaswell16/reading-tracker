# Manga Tracker

A web and mobile app for tracking manga reading progress, powered by MangaDex API.

## Features

- User authentication (sign up/sign in with email)
- Search manga from MangaDex database
- Track manga with statuses: Reading, Plan to Read, Completed
- View manga details and chapters
- Receive notifications for new chapters (planned)

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Firebase account

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
4. Enable Firestore:
   - Go to Firestore Database
   - Create database in production mode
5. Get your Firebase config:
   - Go to Project settings > General > Your apps
   - Click "Add app" > Web app
   - Copy the config object

### Installation

1. Clone this repository
2. Navigate to the `web` directory: `cd web`
3. Install dependencies: `npm install`
4. Update `src/firebase.js` with your Firebase config
5. Start the development server: `npm run dev`

The app will be available at `http://localhost:5173/`

## Usage

1. Sign up or sign in with your email
2. Search for manga using the search bar
3. Click "Add to List" to add manga to your tracking list
4. View your manga list organized by status
5. Click on a manga to view details

## API Usage

This app uses the MangaDex API. Please respect their usage policy:
- Credit MangaDex
- Honor scanlation group removal requests
- No ads or paid services

## Technologies

- React (Vite)
- Firebase (Auth, Firestore)
- MangaDex API

## Future Features

- Chapter reading interface
- Status updates
- External links to MangaDex/Mangafire
- Push notifications for new chapters
- Mobile app (React Native)
- Cloud Functions for automated notifications