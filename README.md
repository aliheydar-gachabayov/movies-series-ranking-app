# Movies & Series Ranking App

A responsive web application that discovers and ranks movies and TV series using data from the [TMDB API](https://developer.themoviedb.org/docs). Users can search titles, filter by genre and media type, sort results, view details and trailers, and save favourites in local storage.

## Features

- Fetches movie and TV data from TMDB.
- Combines top-rated, popular, and highly rated discovery results.
- Uses a custom weighted ranking score.
- Debounced title search.
- Filters by media type and genre.
- Sorts by score, rating, vote count, or popularity.
- Saves favourites in browser local storage.
- Displays details, cast, creators, production country, and YouTube trailers.
- Responsive layout, loading indicator, and toast notifications.

## Ranking formula

Each item receives the following score:

```text
score = (rating × 2.5)
      + (log10(vote_count) × 2)
      + (popularity × 0.02)
```

The formula combines rating, number of votes, and TMDB popularity into one ranking signal. These weights are hand-selected project parameters, not statistically learned coefficients. The ranking is therefore a demonstration of multi-criteria scoring rather than an objective measure of content quality.

## Tech stack

- HTML5
- CSS3
- JavaScript (ES6+)
- TMDB REST API
- Browser LocalStorage

## Run locally

### 1. Get a TMDB API key

Create an account and request an API key from the [TMDB developer settings](https://www.themoviedb.org/settings/api).

### 2. Clone the repository

```bash
git clone https://github.com/aliheydar-gachabayov/movies-series-ranking-app.git
cd movies-series-ranking-app
```

### 3. Configure the API key

Create a local `config.js` file in the project root (it is intentionally ignored by Git):

```javascript
const config = {
  API_KEY: "YOUR_TMDB_API_KEY"
};
```

Alternatively, copy the example file:

```bash
cp config.example.js config.js
```

Then replace the placeholder with your own TMDB API key.

### 4. Open the app

Start a local static web server from the project directory, for example:

```bash
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Project structure

```text
movies-series-ranking-app/
├── index.html
├── script.js
├── style.css
├── config.example.js
├── .gitignore
└── README.md
```

## Notes and limitations

- The app requires an internet connection and a working TMDB API key.
- The API key is used by browser-side JavaScript and can be inspected by users. Do not treat a browser-exposed key as a secret; follow TMDB's current terms and usage guidance. A backend proxy is more appropriate if stronger key protection is required.
- Favourites are stored in the current browser's local storage and are not synchronized between devices.
- API responses and available metadata depend on TMDB.
- The ranking weights are heuristic and have not been validated against user preference data.

## Possible improvements

- Add automated tests for ranking, filtering, and sorting.
- Add pagination or incremental loading.
- Improve API error states and retry behavior.
- Add accessibility checks and keyboard navigation.
- Move API requests behind a backend if key protection or server-side caching is needed.
- Add a deployed demo and screenshots.

## Author

**Aliheydar Gachabayov**

- [GitHub](https://github.com/aliheydar-gachabayov)
- [LinkedIn](https://www.linkedin.com/in/aliheydar-gachabayov)
