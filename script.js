
const API_KEY = config.API_KEY;
const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const FALLBACK = "https://via.placeholder.com/400x600?text=No+Image";

const $ = id => document.getElementById(id);

// Escape external API data before inserting it into HTML templates.
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

const grid = $("grid");
const modal = $("modal");
const modalBody = $("modalBody");
const loader = $("loader");

const search = $("search");
const typeSelect = $("type");
const sortSelect = $("sort");
const genreSelect = $("genre");
const stats = $("stats");

const sortDirBtn = $("sortDir");
const favPanel = $("favouritesPanel");
const favList = $("favList");
const favToggle = $("favToggle");
const toast = $("toast");

let items = [];
let genres = {};
let cache = {};
let sortDir = "desc";
let favourites = JSON.parse(localStorage.getItem("favourites") || "[]");

const safeFetch = async url => {
  try {
    const r = await fetch(url);
    if (!r.ok) throw "";
    return await r.json();
  } catch {
    return null;
  }
};

const saveFavourites = () =>
  localStorage.setItem("favourites", JSON.stringify(favourites));

const showToast = msg => {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
};

async function loadGenres() {
  const [movie, tv] = await Promise.all([
    safeFetch(`${API}/genre/movie/list?api_key=${API_KEY}`),
    safeFetch(`${API}/genre/tv/list?api_key=${API_KEY}`)
  ]);

  [...(movie?.genres || []), ...(tv?.genres || [])]
    .forEach(g => genres[g.id] = g.name);
}

async function fetchAll(type) {
  const endpoints = [
    `${API}/${type}/top_rated?api_key=${API_KEY}&page=`,
    `${API}/${type}/popular?api_key=${API_KEY}&page=`,
    `${API}/discover/${type}?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=200&page=`
  ];

  const map = {};

  for (const base of endpoints) {
    for (let p = 1; p <= 5; p++) {
      const d = await safeFetch(base + p);
      d?.results?.forEach(i => map[i.id] = i);
    }
  }

  return Object.values(map);
}

function normalize(list, type) {
  return list
    .filter(i => i.poster_path)
    .map(i => {
      const rating = i.vote_average || 0;
      const votes = i.vote_count || 0;
      const popularity = i.popularity || 0;

      return {
        id: i.id,
        type,
        title: i.title || i.name,
        rating,
        votes,
        popularity,
        score: 0,
        year: (i.release_date || i.first_air_date || "").slice(0, 4),
        poster: IMG + i.poster_path,
        genres: i.genre_ids.map(id => genres[id]).filter(Boolean)
      };
    });
}

async function loadAll() {
  if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY") {
    loader.innerHTML = "<p>Add your TMDB API key to config.js to load movies and series.</p>";
    return;
  }

  await loadGenres();

  const [moviesRaw, seriesRaw] = await Promise.all([
    fetchAll("movie"),
    fetchAll("tv")
  ]);

  if (moviesRaw.length === 0 && seriesRaw.length === 0) {
    loader.innerHTML = "<p>Could not load titles. Check your TMDB API key and internet connection, then refresh.</p>";
    return;
  }

  const movies = normalize(moviesRaw, "movie");
  const series = normalize(seriesRaw, "series");

  items = [...movies, ...series];

  // Find maximum values for normalization
  const maxVotes = Math.max(...items.map(i => i.votes));
  const maxPopularity = Math.max(...items.map(i => i.popularity));

  // Calculate normalized ranking scores
  items.forEach(item => {
    const normalizedRating = item.rating / 10;

    const normalizedVotes = maxVotes > 0
      ? Math.log1p(item.votes) / Math.log1p(maxVotes)
      : 0;

    const normalizedPopularity = maxPopularity > 0
      ? Math.log1p(item.popularity) / Math.log1p(maxPopularity)
      : 0;

    item.score =
      0.50 * normalizedRating +
      0.25 * normalizedVotes +
      0.25 * normalizedPopularity;
  });

  stats.innerHTML = `
    <div class="stat"><b>${movies.length}</b><br>Movies</div>
    <div class="stat"><b>${series.length}</b><br>Series</div>
  `;

  [...new Set(items.flatMap(i => i.genres))].forEach(g => {
    const o = document.createElement("option");
    o.value = g;
    o.textContent = g;
    genreSelect.appendChild(o);
  });

  render();
  loader.style.display = "none";
}

function render() {
  let list = [...items];
  const q = search.value.toLowerCase();

  if (q) list = list.filter(i => i.title.toLowerCase().includes(q));
  if (typeSelect.value !== "all") {
    list = list.filter(i => i.type === typeSelect.value);
  }
  if (genreSelect.value !== "all") {
    list = list.filter(i => i.genres.includes(genreSelect.value));
  }

  const sorters = {
    score: (a, b) => b.score - a.score,
    rating: (a, b) => b.rating - a.rating,
    votes: (a, b) => b.votes - a.votes,
    popularity: (a, b) => b.popularity - a.popularity
  };

  list.sort(sorters[sortSelect.value]);

  if (sortDir === "asc") list.reverse();

  grid.innerHTML = "";

  list.forEach((i, idx) => {
    const c = document.createElement("div");
    c.className = "card";

    const isFav = favourites.some(
      f => f.id === i.id && f.type === i.type
    );

    c.innerHTML = `
      <button class="fav-star ${isFav ? "active" : ""}">♥</button>
      <div class="rank">#${idx + 1}</div>
      <img src="${escapeHTML(i.poster)}" onerror="this.src='${FALLBACK}'">
      <div class="card-info">
        <h4>${escapeHTML(i.title)}</h4>
        <span>⭐ ${i.rating.toFixed(1)} · 🗳️ ${i.votes.toLocaleString()} · 🔥 ${Math.round(i.popularity)}</span>
      </div>
    `;

    c.querySelector(".fav-star").onclick = e => {
      e.stopPropagation();

      const exists = favourites.find(
        f => f.id === i.id && f.type === i.type
      );

      favourites = exists
        ? favourites.filter(
            f => !(f.id === i.id && f.type === i.type)
          )
        : [...favourites, i];

      saveFavourites();
      showToast(exists ? "Removed from favourites" : "Added to favourites");
      renderFavourites();
      render();
    };

    c.onclick = () => openModal(i.id, i.type);
    grid.appendChild(c);
  });
}

async function openModal(id, type) {
  favPanel?.classList.remove("show");
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  modalBody.textContent = "Loading...";

  const cacheKey = `${type}-${id}`;

  if (!cache[cacheKey]) {
    const apiType = type === "series" ? "tv" : "movie";

    cache[cacheKey] = await safeFetch(
      `${API}/${apiType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits`
    );
  }

  const d = cache[cacheKey];

  if (!d) {
    modalBody.textContent = "No data";
    return;
  }

  const year = type === "movie"
    ? (d.release_date || "").slice(0, 4)
    : `${(d.first_air_date || "").slice(0, 4)}–${d.last_air_date?.slice(0, 4) || ""}`;

  const yt = d.videos?.results
    ?.filter(v => v.site === "YouTube")
    ?.sort((a, b) => {
      const p = ["Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes"];
      return p.indexOf(a.type) - p.indexOf(b.type);
    })[0];

  const creator = (() => {
    if (type === "series") {
      return (
        d.created_by?.map(c => c.name).join(", ") ||
        d.credits?.crew?.find(c => c.job === "Executive Producer")?.name ||
        d.credits?.crew?.find(c => c.job === "Producer")?.name ||
        "Unknown"
      );
    }

    return (
      d.credits?.crew?.find(c =>
        ["Director", "Screenplay", "Story", "Writer", "Producer"].includes(c.job)
      )?.name || "Unknown"
    );
  })();

  const actors = d.credits?.cast?.slice(0, 12).map(a => a.name).join(", ") || "Unknown";
  const country = d.production_countries?.[0];
  const flag = country
    ? `https://flagcdn.com/w640/${country.iso_3166_1.toLowerCase()}.png`
    : "";

  modalBody.innerHTML = `
    <div class="modal-header">
      <img class="modal-poster" src="${IMG + d.poster_path}" onerror="this.src='${FALLBACK}'">
      <div>
        <h2>${escapeHTML(d.title || d.name)} ${escapeHTML(year ? `(${year})` : "")}</h2>
        <p>${escapeHTML(d.genres.map(g => g.name).join(", "))}</p>
        <div class="section"><h3>📖 Overview</h3><p>${escapeHTML(d.overview || "No overview.")}</p></div>
        <div class="section"><h3>🎭 Cast</h3><p>${escapeHTML(actors)}</p></div>
        <div class="section"><h3>✍️ Creator</h3><p>${escapeHTML(creator)}</p></div>
      </div>
      <div class="country-flag" style="background-image:url('${escapeHTML(flag)}')">
        <div class="country-info">
          <span class="name">${escapeHTML(country?.name || "N/A")}</span>
        </div>
      </div>
    </div>
    ${yt ? `
    <div class="section trailer-section">
      <h3>▶️ Trailer</h3>
      <div class="trailer-wrapper">
        <iframe src="https://www.youtube.com/embed/${escapeHTML(yt.key)}" allowfullscreen></iframe>
      </div>
    </div>` : ""}
  `;
}

function renderFavourites() {
  if (!favList) return;

  favList.innerHTML = favourites.length
    ? ""
    : "<p style='opacity:.6'>No favourites yet</p>";

  favourites.forEach(i => {
    const d = document.createElement("div");
    d.style.cssText = "display:flex;gap:12px;margin-bottom:12px;cursor:pointer";
    d.innerHTML = `<img src="${escapeHTML(i.poster)}" style="width:50px;border-radius:8px"><div><b>${escapeHTML(i.title)}</b><br><small>${escapeHTML(i.type)}</small></div>`;

    d.onclick = () => {
      favPanel.classList.remove("show");
      openModal(i.id, i.type);
    };

    favList.appendChild(d);
  });
}

$("close").onclick = () => {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
};

search.oninput = (() => {
  let t;

  return () => {
    clearTimeout(t);
    t = setTimeout(render, 250);
  };
})();

[typeSelect, genreSelect].forEach(e => e.onchange = render);

sortSelect.onchange = () => {
  sortDir = "desc";
  sortDirBtn.textContent = "⬇";
  render();
};

sortDirBtn.onclick = () => {
  sortDir = sortDir === "desc" ? "asc" : "desc";
  sortDirBtn.textContent = sortDir === "desc" ? "⬇" : "⬆";
  render();
};

favToggle.onclick = () => {
  favPanel.classList.toggle("show");
  renderFavourites();
};

loadAll();
