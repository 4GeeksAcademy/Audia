import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AlbumDetail = () => {
    const { artist, album } = useParams();
    const { store } = useGlobalReducer();
    const [albumData, setAlbumData] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [userReview, setUserReview] = useState(null);
    const [isLoadingReview, setIsLoadingReview] = useState(true);
    const [albumReviews, setAlbumReviews] = useState([]);
    const [isLoadingAlbumReviews, setIsLoadingAlbumReviews] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadAlbum = async () => {
            if (!artist?.trim() || !album?.trim()) {
                if (!cancelled) {
                    setAlbumData(null);
                    setError("Faltan datos del álbum para cargar el detalle");
                    setIsLoading(false);
                }
                return;
            }

            try {
                if (!cancelled) {
                    setIsLoading(true);
                    setError("");
                }

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const params = new URLSearchParams({
                    artist: artist.trim(),
                    album: album.trim(),
                });
                const response = await fetch(`${backendUrl}/api/lastfm/album?${params.toString()}`);
                const data = await response.json();

                if (cancelled) return;

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo cargar el álbum");
                }

                setAlbumData(data.album || null);
                console.log("Data del álbum:", data.album);
            } catch (err) {
                if (cancelled) return;
                setAlbumData(null);
                setError(err.message || "No se pudo cargar el álbum");
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadAlbum();
        // Al desmontar o re-ejecutar el efecto, marca cancelled para ignorar respuestas tardías del fetch
        return () => {
            cancelled = true;
        };
    }, [artist, album]);

    useEffect(() => {
        const loadUserReview = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setUserReview(null);
                setIsLoadingReview(false);
                return;
            }

            if (!albumData?.id) {
                return;
            }

            try {
                setIsLoadingReview(true);

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const response = await fetch(`${backendUrl}/api/review?album_id=${encodeURIComponent(albumData.id)}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo cargar la reseña");
                }

                setUserReview(data.review);
            } catch (err) {
                setUserReview(null);
            } finally {
                setIsLoadingReview(false);
            }
        };

        loadUserReview();
    }, [albumData?.id]);

    useEffect(() => {
        const loadAlbumReviews = async () => {
            if (!albumData?.id) {
                return;
            }

            try {
                setIsLoadingAlbumReviews(true);

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const response = await fetch(
                    `${backendUrl}/api/reviews/album?album_id=${encodeURIComponent(albumData.id)}`
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "No se pudieron cargar las reseñas");
                }

                setAlbumReviews(data.reviews || []);
            } catch (err) {
                setAlbumReviews([]);
            } finally {
                setIsLoadingAlbumReviews(false);
            }
        };

        loadAlbumReviews();
    }, [albumData?.id]);

    if (isLoading) {
        return <div className="album-detail-page"><p>Cargando álbum...</p></div>;
    }

    if (error || !albumData) {
        return <div className="album-detail-page"><p>{error || "No se encontró el álbum"}</p><Link to="/">Volver a Inicio</Link></div>;
    }
    const fallbackImage = "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";
    const backLink = store.lastSearchQuery
        ? `/search?q=${encodeURIComponent(store.lastSearchQuery)}`
        : "/";

    return (
        <div className="album-detail-page">
            <Link className="back-link" to={backLink}>← Volver</Link>
            <div className="album-detail-card">
                <div className="d-flex flex-column gap-3 overflow-hidden">
                    <img
                        src={albumData.cover || fallbackImage}
                        alt={albumData.name}
                        className="img-fluid rounded-4 w-100 object-fit-cover album-detail-cover-image"
                    />
                    <div className="d-grid gap-2">
                        <button type="button" className="hero-button w-100 border-0 album-detail-favorite-btn">
                            ❤️ Guardar en favoritos
                        </button>
                        <Link
                            to={`/review?artist=${encodeURIComponent(albumData.artist)}&album=${encodeURIComponent(albumData.name)}`}
                            className="user-link w-100 border-0 text-white fw-bold album-detail-review-btn text-center"
                        >
                            {isLoadingReview ? "Cargando reseña..." : userReview ? "Ver tu reseña" : "Haz una reseña"}
                        </Link>
                        {userReview ? (
                            <div className="d-flex justify-content-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        style={{ color: userReview.rating >= star ? "rgba(8, 18, 38, 0.92)" : "#666" }}
                                    >
                                        <i className={`fa${userReview.rating >= star ? "s" : "r"} fa-star`}></i>
                                    </span>
                                ))}
                            </div>
                        ) : null}
                        {isLoadingAlbumReviews ? (
                            <p className="small text-secondary mb-0">Cargando reseñas...</p>
                        ) : albumReviews.length > 0 ? (
                            <div className="mt-2 overflow-hidden">
                                <h3 className="h6 fw-bold mb-3">Reseñas</h3>
                                {albumReviews.map((albumReview) => {
                                    const reviewPath = `/review?artist=${encodeURIComponent(albumData.artist)}&album=${encodeURIComponent(albumData.name)}&user_id=${albumReview.user_id}`;
                                    const authorName = albumReview.user?.display_name || albumReview.user?.username || "Usuario";

                                    return (
                                        <Link
                                            key={albumReview.id}
                                            to={reviewPath}
                                            className="card mb-2 border-0 bg-primary-subtle shadow-sm text-decoration-none text-reset"
                                        >
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                                                    <div className="flex-grow-1 overflow-hidden">
                                                        <span className="fw-bold text-truncate d-block">{authorName}</span>
                                                    </div>
                                                    <div className="d-flex flex-shrink-0 gap-1 small">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <span
                                                                key={star}
                                                                style={{ color: albumReview.rating >= star ? "rgba(8, 18, 38, 0.92)" : "#666" }}
                                                            >
                                                                <i className={`fa${albumReview.rating >= star ? "s" : "r"} fa-star`}></i>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="card-text small mb-0 line-clamp-3 text-break">{albumReview.text}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>
                <div>
                    <div className="d-flex justify-content-between">
                        <p className="album-detail-label">Álbum</p>
                        {albumData.link ? (
                        <Link
                            to={albumData.link}
                            className="hero-button !p-1 album-detail-ver-mas-btn border-0 text-decoration-none rounded-pill fw-bold"
                            >
                                Ver más
                            </Link>
                        ) : null}
                    </div>
                    <h1>{albumData.name}</h1>
                    <p>{albumData.artist}</p>
                    {albumData.tags?.length ? 
                    <div>{albumData.tags?.map((tag) => (
                        <span className="rounded-4 px-2 text-light small me-1 album-detail-card-tag" key={tag}>{tag}</span>
                    ))}</div> : null}

                    {albumData.summary ? (
                        <div dangerouslySetInnerHTML={{ __html: "<strong>Summary: </strong>" + albumData.summary }} />
                    ) : (
                        <p>No hay detalles disponibles para este álbum.</p>
                    )}

                    {albumData.tracks?.length ? ( 
                        <>
                            <p className="mb-0 mt-2"><strong>Tracks:</strong> </p>
                            <ul className="list-group list-group-flush">
                                {albumData.tracks.map((track) => (
                                    <li className="list-group-item rounded album-detail-card-track" key={track.name}>
                                        <div className="d-flex justify-content-between mb-0">
                                            <p className="mb-0">{track.name}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No hay tracks disponibles para este álbum.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
