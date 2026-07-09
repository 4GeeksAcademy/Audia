import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    try {
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, [location.pathname]);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearchError("Escribe un álbum o artista para buscar");
      return;
    }

    setIsLoading(true);
    setSearchError("");
    setSearchResults([]);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  };

  return (
    <header className="navbar">
      <Link
        to="/"
        className="logo"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <h1>Audia</h1>
      </Link>

      <div className="navbar-right">
        <form className="navbar-search" role="search" onSubmit={handleSearch}>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              if (!event.target.value.trim()) {
                setSearchResults([]);
                setSearchError("");
              }
            }}
            placeholder="Buscar álbumes o artistas"
            aria-label="Buscar álbumes o artistas"
          />
          <button type="submit" aria-label="Buscar" disabled={isLoading}>
            {isLoading ? "…" : "🔍"}
          </button>

          {searchResults.length > 0 || searchError ? (
            <div className="navbar-search-results">
              {searchError && searchResults.length === 0 ? (
                <p className="navbar-search-feedback">{searchError}</p>
              ) : null}

              {searchResults.map((result) => {
                const detailPath = result.type === "album"
                  ? `/album/${encodeURIComponent(result.id || result.name)}`
                  : `/artist/${encodeURIComponent(result.id || result.name)}`;

                return (
                  <Link
                    key={`${result.type}-${result.id || result.name}`}
                    to={detailPath}
                    className="navbar-search-result"
                    onClick={clearSearch}
                  >
                    <span>{result.name}</span>
                    <small>{result.type === "album" ? "Álbum" : "Artista"}</small>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </form>

        <nav>
          <Link to="/ultimos-lanzamientos">Últimos lanzamientos</Link>
          <Link to="/generos">Géneros</Link>
          <Link to="/random-pick">Random Pick</Link>
          <Link to="/review">Reseñas</Link>
        </nav>

        <Link
          to={user ? "/profile" : "/login"}
          className="user-link"
        >
          {user ? user.username : "Iniciar sesión"}
        </Link>
      </div>
    </header>
  );
};