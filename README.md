# 🎬 Movies & Series Ranking App

A responsive web application that discovers and ranks movies and TV series using data from the [TMDB API](https://developer.themoviedb.org/docs). Users can search titles, filter by genre and media type, sort results, view details and trailers, and save favourites in local storage.

## Features

- Fetches movie and TV series data from TMDB.
- Combines popular, top-rated, and highly rated discovery results.
- Uses a custom normalized ranking formula.
- Search titles with debounced input.
- Filter by media type and genre.
- Sort by score, rating, vote count, or popularity.
- Save favourites using browser LocalStorage.
- View details, cast, creators, production country, and YouTube trailers.
- Responsive layout with loading indicators and notifications.

## Ranking Formula

Each movie and TV series receives a normalized ranking score based on three factors:

```text
score = (0.50 × normalized_rating)
      + (0.25 × normalized_votes)
      + (0.25 × normalized_popularity)
```

The factors are normalized as follows:

- **Rating:** TMDB rating divided by 10.
- **Votes:** Logarithmically normalized vote count using the maximum vote count in the loaded dataset.
- **Popularity:** Logarithmically normalized popularity using the maximum popularity in the loaded dataset.

The ranking gives 50% weight to rating, 25% to vote count, and 25% to popularity.

The weights are manually selected project parameters, not statistically learned coefficients. The ranking is a heuristic scoring method and does not represent an objective measure of content quality. Scores may change when the loaded dataset changes.

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- TMDB REST API
- Browser LocalStorage

## Run Locally

### 1. Get a TMDB API key

Create an account and request an API key from the [TMDB developer settings](https://www.themoviedb.org/settings/api).

### 2. Clone the repository

```bash
git clone https://github.com/aliheydar-gachabayov/movies-series-ranking-app.git
cd movies-series-ranking-app
```

### 3. Configure the API key

Copy the example configuration:

```bash
cp config.example.js config.js
```

Replace the placeholder in `config.js` with your own TMDB API key.

The local `config.js` file is ignored by Git and should not be committed.

**Note:** The API key is used by browser-side JavaScript and can be inspected by users. Do not treat it as a secret.

### 4. Start the application

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser.

## Project Structure

```text
movies-series-ranking-app/
├── index.html
├── script.js
├── style.css
├── config.example.js
├── .gitignore
├── README.md
└── Technical_Report.pdf
```

## Notes and Limitations

- The application requires an internet connection and a working TMDB API key.
- Favourites are stored in the current browser's LocalStorage and are not synchronized between devices.
- API responses and available metadata depend on TMDB.
- Ranking weights are manually selected and have not been validated against user preference data.
- Ranking scores depend on the data returned by TMDB.

## Possible Improvements

- Add automated tests for ranking, filtering, and sorting.
- Add pagination or incremental loading.
- Improve API error states and retry behavior.
- Add accessibility checks and keyboard navigation.

## Author

**Aliheydar Gachabayov**

- [GitHub](https://github.com/aliheydar-gachabayov)
- [LinkedIn](https://www.linkedin.com/in/aliheydar-gachabayov)
