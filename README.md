# 🎬 Top Movies & Series

A dynamic web application that ranks and displays top movies and TV series using multi-criteria scoring.

## 🚀 Features

- Fetches data from TMDB API
- Custom weighted ranking algorithm
- Search functionality (debounced)
- Filter by type and genre
- Multi-criteria sorting
- Favourite system (LocalStorage)
- Modal with detailed information
- Trailer integration (YouTube)
- Country flag display
- Responsive UI
- Loader and toast notifications

## 🧠 Scoring Algorithm

Items are ranked using a custom weighted formula:

Score = (Rating × 2.5) + (log10(Votes) × 2) + (Popularity × 0.02)

This ensures balance between quality, popularity, and engagement.

## 🏗 Architecture

- HTML – semantic structure
- CSS – component-based responsive design
- JavaScript – modular logic & state management
- API integration – asynchronous fetch with caching
- Local storage – client-side persistence

## 📦 Technologies Used

- HTML5
- CSS3 (Custom Properties, Grid, Animations)
- JavaScript (ES6+)
- TMDB REST API

## 📱 Responsive Design

Fully responsive layout with adaptive grid and modal structure.