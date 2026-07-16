import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();
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
      setSearchError("Escribe un álbum para buscar");
      return;
    }

    setIsLoading(true);
    setSearchError("");
    setSearchResults([]);
    dispatch({ type: "set_last_search_query", payload: query });
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
        <img src="/albums/logo.png" alt="Audia" className="navbar-logo" />
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
            placeholder="Buscar álbumes"
            aria-label="Buscar álbumes"
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
                if (!result.artist || !result.name) {
                  return null;
                }

                const detailPath = `/album/${encodeURIComponent(result.artist)}/${encodeURIComponent(result.name)}`;

                return (
                  <Link
                    key={`${result.artist}-${result.name}`}
                    to={detailPath}
                    className="navbar-search-result"
                    onClick={clearSearch}
                  >
                    <span>{result.name}</span>
                    <small>Álbum</small>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </form>

        <nav>
          <Link to="/ultimos-lanzamientos">Lanzamientos destacados</Link>
          
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