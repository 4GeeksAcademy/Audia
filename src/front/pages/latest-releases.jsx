import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
    "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";

const FEATURED_TAG = "pop";

export const LatestReleases = () => {
    const [albums, setAlbums] = useState([]);
    const [featuredTag, setFeaturedTag] = useState(FEATURED_TAG);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFeaturedAlbums = async () => {
            try {
                setIsLoading(true);
                setError("");

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const params = new URLSearchParams({
                    tag: FEATURED_TAG,
                    limit: "12",
                });
                const response = await fetch(
                    `${backendUrl}/api/lastfm/featured-albums?${params.toString()}`
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "No se pudieron cargar los lanzamientos");
                }

                setFeaturedTag(data.tag || FEATURED_TAG);
                setAlbums(data.results || []);
            } catch (err) {
                setAlbums([]);
                setError(err.message || "No se pudieron cargar los lanzamientos");
            } finally {
                setIsLoading(false);
            }
        };

        loadFeaturedAlbums();
    }, []);

    return (
        <main className="releases-page">
            <section className="releases-header">
                <p className="section-eyebrow">Explora música nueva</p>
                <h1>Lanzamientos destacados</h1>
                <p>
                    Los álbumes más populares del tag {featuredTag} según Last.fm.
                </p>
            </section>

            <section className="releases-grid">
                {isLoading ? (
                    <p>Cargando lanzamientos...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : albums.length === 0 ? (
                    <p>No hay lanzamientos disponibles.</p>
                ) : (
                    albums.map((album) => {
                        const detailPath = `/album/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.name)}`;

                        return (
                            <Link
                                to={detailPath}
                                className="release-card"
                                key={`${album.artist}-${album.name}`}
                            >
                                <div className="release-cover">
                                    <img
                                        src={album.cover || FALLBACK_IMAGE}
                                        alt={`Portada de ${album.name}`}
                                        onError={(e) => {
                                            e.target.src = FALLBACK_IMAGE;
                                        }}
                                    />
                                </div>

                                <div className="release-card-info">
                                    <h2>{album.name}</h2>
                                    <p>{album.artist}</p>
                                </div>
                            </Link>
                        );
                    })
                )}
            </section>
        </main>
    );
};
