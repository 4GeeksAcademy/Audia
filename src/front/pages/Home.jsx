import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
    "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";

const FEATURED_TAG = "pop";

export const Home = () => {
    const [albums, setAlbums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFeaturedAlbums = async () => {
            try {
                setIsLoading(true);

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const params = new URLSearchParams({
                    tag: FEATURED_TAG,
                    limit: "8",
                });
                const response = await fetch(
                    `${backendUrl}/api/lastfm/featured-albums?${params.toString()}`
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "No se pudieron cargar los lanzamientos");
                }

                setAlbums(data.results || []);
            } catch (err) {
                setAlbums([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFeaturedAlbums();
    }, []);

    return (
        <main>
            <section className="hero">
                <div className="hero-content">
                    <h2>¡Revolver cumple 60 años!</h2>
                    <p>
                        Celebra el aniversario de este clásico leyendo las reseñas de los usuarios
                    </p>
                    <a href="#" className="hero-button">Ir a las reseñas</a>
                </div>
            </section>

            <section className="album-section">
                <div className="section-header">
                    <div id="ulti">
                        <p className="section-eyebrow">Explora la comunidad</p>
                        <h2>Lanzamientos destacados</h2>
                    </div>

                    <Link to="/ultimos-lanzamientos">Ver todos</Link>
                </div>

                <div className="album-carousel">
                    {isLoading ? (
                        <p>Cargando lanzamientos...</p>
                    ) : albums.length === 0 ? (
                        <p>No hay lanzamientos disponibles.</p>
                    ) : (
                        albums.map((album) => {
                            const detailPath = `/album/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.name)}`;

                            return (
                                <Link to={detailPath} className="album-card" key={`${album.artist}-${album.name}`}>
                                    <img
                                        src={album.cover || FALLBACK_IMAGE}
                                        alt={`Portada de ${album.name}`}
                                        onError={(e) => {
                                            e.target.src = FALLBACK_IMAGE;
                                        }}
                                    />

                                    <div className="album-card-info">
                                        <h3>{album.name}</h3>
                                        <p>{album.artist}</p>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </section>
        </main>
    );
};
