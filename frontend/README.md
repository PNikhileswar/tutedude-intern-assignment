TuteDude Learning Platform
Project Overview
TuteDude is an interactive video learning platform for programming tutorials. The application lets users browse courses organized by programming language, watch tutorial videos, and automatically track their learning progress. Built with the MERN stack (MongoDB, Express, React, Node.js), this platform provides a seamless educational experience with features like progress tracking, video resume capabilities, and a responsive user interface.

Key Features
📚 Organized Course Structure
Language Categories: Browse courses by programming language (JavaScript, Python, HTML/CSS)
Course Playlists: Related videos grouped into cohesive learning paths
Intuitive Navigation: Clean UI for browsing and selecting courses
🎬 Advanced Video Player
Custom Controls: User-friendly video player with intuitive controls
Resume Functionality: Automatically continue videos from where you left off
Progress Tracking: Visual indicators showing watched segments of each video
Next Video Navigation: Easy access to the next tutorial in a playlist
📊 Progress Tracking
Real-time Updates: Progress saved as you watch videos
Course Completion: Track overall course completion percentage
Video-level Progress: Individual progress for each tutorial video
Progress Statistics: Time watched, time remaining, and completed videos
👤 User Authentication
Secure Login/Signup: Encrypted user authentication
JWT Authentication: Token-based authentication for API requests
Protected Content: Course content access for registered users
Persistent Sessions: Remember user progress across sessions
🔄 Real-time Connectivity
WebSocket Integration: Real-time progress updates via Socket.io
Connection Status: Visual indicators for online/offline status
Automatic Sync: Progress synced across devices when logged in
Getting Started
Prerequisites
Node.js v14 or higher
MongoDB
npm or yarn

Installation
Clone the repository
git clone https://github.com/yourusername/tutedude-intern-assignment.git
cd tutedude-intern-assignment

Set up the backend
cd backend
npm install

Set up the frontend
cd ../frontend
npm install

Seed the database
cd ../backend
npm run seed

Start the backend server
npm run dev

Start the frontend application
cd ../frontend
npm start

Access the application
Open your browser and navigate to http://localhost:3000

Usage Guide
Register or Login

Create a new account or sign in with existing credentials
Browse Courses

Navigate through different programming languages and available courses
Select a Course

Click on a course to view its contents and videos
See course progress and completion status
Watch Videos

Click on a video to start watching
Your progress is automatically saved as you watch
Use the video controls for playback options
Navigate to the next video using the "Next" button
Track Your Progress

View your overall and video-specific progress in real-time
Resume watching from where you left off automatically
Technologies Used
Frontend: React, React Router, Axios, Socket.io-client
Backend: Node.js, Express, MongoDB, Mongoose, Socket.io
Authentication: JSON Web Tokens (JWT), bcrypt
Video Player: React Player
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Tutorial videos sourced from YouTube educational channels
Built as part of TuteDude internship assignment