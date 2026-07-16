import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const getQueryParam = (search, key) => {
    const params = new URLSearchParams(search);
    return params.get(key) || "";
};

export const SearchResults = () => {
    const location = useLocation();
    const { dispatch } = useGlobalReducer();
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [fetchedQuery, setFetchedQuery] = useState("");

    useEffect(() => {
        const query = getQueryParam(location.search, "q").trim();

        if (!query) {
            setFetchedQuery("");
            setResults([]);
            setError("Escribe un álbum para comenzar la búsqueda");
            setIsLoading(false);
            return;
        }

        dispatch({ type: "set_last_search_query", payload: query });

        if (query === fetchedQuery) {
            return;
        }

        const loadResults = async () => {
            try {
                setIsLoading(true);
                setError("");

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const response = await fetch(`${backendUrl}/api/lastfm/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();

                // 🚨 REVISA ESTO EN LA CONSOLA DE TU NAVEGADOR (F12)
                console.log("Data exacta recibida del Backend:", data);

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo completar la búsqueda");
                }

                setFetchedQuery(query);

                // Controlamos si la lista de resultados viene vacía desde el servidor
                if (data.results && data.results.length > 0) {
                    setResults(data.results);
                } else {
                    setResults([]);
                    setError("No se encontraron resultados para esta búsqueda");
                }
            } catch (err) {
                setResults([]);
                setError(err.message || "No se pudo completar la búsqueda");
            } finally {
                setIsLoading(false);
            }
        };

        loadResults();
    }, [location.search]);

    return (
        <main className="search-results-page">
            <Link to="/" className="search-back-link">
                ← Volver a Inicio
            </Link>

            <h1>Resultados de búsqueda</h1>

            <p className="search-results-copy">
                {getQueryParam(location.search, "q")
                    ? `Mostrando resultados para “${getQueryParam(location.search, "q")}”`
                    : "Introduce una búsqueda"}
            </p>

            {isLoading ? (
                <div className="search-state">
                    <p>Buscando álbumes...</p>
                </div>
            ) : error ? (
                <div className="search-error">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="search-results-grid">
                    {results.map((result) => {
                        if (!result.artist || !result.name) return null;

                        const detailPath = `/album/${encodeURIComponent(result.artist)}/${encodeURIComponent(result.name)}`;
                        const fallbackImage =
                            "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";

                        return (
                            <Link
                                key={`${result.artist}-${result.name}`}
                                to={detailPath}
                                className="search-result-card"
                            >
                                <div className="search-result-cover">
                                    <img
                                        src={result.cover || result.image || fallbackImage}
                                        alt={result.name}
                                        onError={(e) => {
                                            e.target.src = fallbackImage;
                                        }}
                                    />
                                </div>

                                <div className="search-result-info">
                                    <strong>{result.name}</strong>

                                    {result.artist && <span>{result.artist}</span>}

                                    {result.year && <small>{result.year}</small>}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
};