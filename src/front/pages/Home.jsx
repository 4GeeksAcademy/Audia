import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
    "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";

const FEATURED_TAG = "pop";

const popularReviews = [
    {
        user: "sofiamusic",
        rating: "★★★★★",
        text: "Petals es un susurro hermoso. Ariana muestra una vulnerabilidad que nunca habíamos visto antes.",
        album: "Petals",
        artist: "Ariana Grande",
        image: "/albums/petals.jpg",
        likes: 32,
        comments: 4,
    },
    {
        user: "andresbeatz",
        rating: "★★★★★",
        text: "Octane tiene ese sonido oscuro que te atrapa desde el primer segundo.",
        album: "Octane",
        artist: "Don Toliver",
        image: "/albums/octane.png",
        likes: 28,
        comments: 3,
    },
    {
        user: "mel_0_0",
        rating: "★★★★☆",
        text: "Uno de los mejores trabajos de J. Cole. Crudo, honesto y necesario.",
        album: "The Fall-Off",
        artist: "J. Cole",
        image: "/albums/the-fall-off.jpg",
        likes: 25,
        comments: 6,
    },
];

export const Home = () => {
    const [featuredAlbums, setFeaturedAlbums] = useState([]);
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

                setFeaturedAlbums(data.results || []);
            } catch (err) {
                setFeaturedAlbums([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFeaturedAlbums();
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
                        <h2>Reseñas populares</h2>
                    </div>

                    <a href="/review">Ver todas</a>
                </div>

                <div className="review-grid">
                    {popularReviews.map((review) => (
                        <article className="review-card" key={`${review.user}-${review.album}`}>
                            <div className="review-top">
                                <div>
                                    <strong>{review.user}</strong>
                                    <span>{review.rating}</span>
                                </div>

                                <small>Hace 2h</small>
                            </div>

                            <p className="review-text">{review.text}</p>

                            <div className="review-bottom">
                                <div className="review-album">
                                    <img src={review.image} alt={`Portada de ${review.album}`} />

                                    <div>
                                        <strong>{review.album}</strong>
                                        <span>{review.artist}</span>
                                    </div>
                                </div>

                                <div className="review-actions">
                                    <span>♡ {review.likes}</span>
                                    <span>▢ {review.comments}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
};
