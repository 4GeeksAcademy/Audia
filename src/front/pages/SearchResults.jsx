import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const getQueryParam = (search, key) => {
    const params = new URLSearchParams(search);
    return params.get(key) || "";
};

export const SearchResults = () => {
    const location = useLocation();
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const query = getQueryParam(location.search, "q").trim();

        if (!query) {
            setResults([]);
            setError("Escribe un álbum para comenzar la búsqueda");
            setIsLoading(false);
            return;
        }

        const loadResults = async () => {
            try {
                setIsLoading(true);
                setError("");

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const response = await fetch(`${backendUrl}/api/reccobeats/search?q=${encodeURIComponent(query)}&type=all`);
                const data = await response.json();

                // 🚨 REVISA ESTO EN LA CONSOLA DE TU NAVEGADOR (F12)
                console.log("Data exacta recibida del Backend:", data);

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo completar la búsqueda");
                }

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
        <main className="search-results-page" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "1.5rem", color: "#00b0ff", textDecoration: "none", fontWeight: "bold" }}>
                ← Volver a Inicio
            </Link>

            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Resultados de búsqueda</h1>
            <p style={{ color: "#666", marginBottom: "2rem" }}>
                {getQueryParam(location.search, "q") ? `Mostrando resultados para “${getQueryParam(location.search, "q")}”` : "Introduce una búsqueda"}
            </p>

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ fontSize: "1.2rem", color: "#666" }}>Buscando álbumes...</p>
                </div>
            ) : error ? (
                <div style={{ padding: "1rem", backgroundColor: "#fff3cd", color: "#856404", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #ffeeba" }}>
                    <p style={{ margin: 0 }}>{error}</p>
                </div>
            ) : (
                <div className="search-results-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "1.5rem"
                }}>
                    {results.map((result) => {
                        // Forzamos la redirección al detalle del álbum usando su ID o nombre
                        const detailPath = `/album/${encodeURIComponent(result.id || result.name)}`;
                        const fallbackImage = "https://via.placeholder.com/180?text=Sin+Portada";

                        return (
                            <Link
                                key={`${result.type}-${result.id || result.name}`}
                                to={detailPath}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    textDecoration: "none",
                                    color: "inherit",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    backgroundColor: "#fdfdfd",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    border: "1px solid #e0e0e0",
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.03)";
                                    e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                                }}
                            >
                                {/* Contenedor de la Portada del Álbum */}
                                <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", backgroundColor: "#eaeaea" }}>
                                    <img
                                        src={result.cover || result.image || fallbackImage}
                                        alt={result.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        onError={(e) => { e.target.src = fallbackImage; }}
                                    />
                                </div>

                                {/* Cuerpo de la tarjeta con la información técnica */}
                                <div style={{ padding: "0.8rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                    <strong style={{
                                        fontSize: "0.95rem",
                                        lineHeight: "1.2",
                                        marginBottom: "0.4rem",
                                        display: "-webkit-box",
                                        WebkitLineClamp: "2",
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {result.name}
                                    </strong>

                                    {result.artist && (
                                        <span style={{ fontSize: "0.85rem", color: "#444", marginTop: "auto" }}>
                                            {result.artist}
                                        </span>
                                    )}

                                    {result.year && (
                                        <span style={{ fontSize: "0.8rem", color: "#888", marginTop: "2px" }}>
                                            {result.year}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
};