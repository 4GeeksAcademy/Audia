import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
    "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";

const FEATURED_TAG = "pop";



export const Home = () => {
    const [recentReviews, setRecentReviews] = useState([]);
    const [featuredAlbums, setFeaturedAlbums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadHome = async () => {
            try {
                setIsLoading(true);

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

                // =====================
                // Álbumes destacados
                // =====================
                const params = new URLSearchParams({
                    tag: FEATURED_TAG,
                    limit: "8",
                });

                const albumsResponse = await fetch(
                    `${backendUrl}/api/lastfm/featured-albums?${params.toString()}`
                );

                const albumsData = await albumsResponse.json();

                if (albumsResponse.ok) {
                    setFeaturedAlbums(albumsData.results || []);
                }

                // =====================
                // Reseñas recientes
                // =====================
                const reviewsResponse = await fetch(
                    `${backendUrl}/api/reviews/recent`
                );

                const reviewsData = await reviewsResponse.json();
                console.log("RESEÑAS:", JSON.stringify(reviewsData, null, 2));
                if (reviewsResponse.ok) {
                    setRecentReviews(reviewsData.reviews || []);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadHome();
    }, []);

    return (
        <main>
            <section className="home-hero">
                <div className="home-hero-text">
                    <h1>
                        Descubre música.
                        <span>Comparte lo que te hace sentir.</span>
                    </h1>

                    <p>
                        Explora álbumes, escribe reseñas, crea listas y encuentra tu próxima obsesión musical.
                    </p>

                    <div className="home-hero-actions">
                        <Link to="/ultimos-lanzamientos" className="primary-btn">
                            Explorar álbumes
                        </Link>
                    </div>
                </div>

                <div className="home-hero-art">
                    <img
                        src="/albums/the-fall-off.jpg"
                        alt="The Fall-Off"
                        className="hero-album hero-album-left"
                    />

                    <img
                        src="/albums/cloud-9.jpg"
                        alt="Cloud 9"
                        className="hero-album hero-album-main"
                    />

                    <img
                        src="/albums/with-heaven-on-top.jpg"
                        alt="With Heaven on Top"
                        className="hero-album hero-album-right"
                    />

                    <div className="hero-review-card">
                        <strong>marce_23</strong>
                        <span>★★★★★</span>
                        <p>Un álbum lleno de emociones. Letras honestas y una producción preciosa.</p>
                    </div>
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
                    ) : featuredAlbums.length === 0 ? (
                        <p>No hay lanzamientos disponibles.</p>
                    ) : (
                        featuredAlbums.map((album) => {
                            const detailPath = `/album/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.name)}`;

                            return (
                                <Link
                                    to={detailPath}
                                    className="album-card release-card"
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

            <section className="review-section">
                <div className="section-header">
                    <div>
                        <p className="section-eyebrow">Comunidad</p>
                        <h2>Reseñas recientes</h2>
                    </div>

                    <a href="/review">Ver todas</a>
                </div>

                <div className="review-grid">
                    {recentReviews.map((review) => {
                        const reviewPath = `/review?artist=${encodeURIComponent(review.artist)}&album=${encodeURIComponent(review.album)}&user_id=${review.user_id}`;

                        return (
                            <Link
                                to={reviewPath}
                                className="review-card"
                                key={`${review.user}-${review.album}`}
                            >
                                <div className="review-top">
                                    <div>
                                        <strong>{review.user}</strong>
                                        <span>{"★".repeat(review.rating)}</span>
                                    </div>

                                    <small>AUDIA</small>
                                </div>

                                <p className="review-text">{review.text}</p>

                                <div className="review-bottom">
                                    <div className="review-album">
                                        <img src={review.cover || FALLBACK_IMAGE} alt={review.album} />

                                        <div>
                                            <strong>{review.album}</strong>
                                            <span>{review.artist}</span>
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </main>
    );
};
