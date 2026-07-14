import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const FALLBACK_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";

const Review = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const artist = searchParams.get("artist")?.trim() || "";
    const album = searchParams.get("album")?.trim() || "";
    const externalUserId = searchParams.get("user_id")?.trim() || "";

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const authenticatedUserId = storedUser?.id ? String(storedUser.id) : "";

    const [albumData, setAlbumData] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [userReview, setUserReview] = useState(null);
    const [isLoadingReview, setIsLoadingReview] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token && !externalUserId) {
            navigate("/login");
        }
    }, [navigate, externalUserId]);

    const handleCreateReview = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setSubmitError("");

        const token = localStorage.getItem("token");

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        try {
            const response = await fetch(`${backendUrl}/api/review`, {
                method: "POST",
                body: JSON.stringify({ review, rating, album_id: albumData.id }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "No se pudo crear la reseña");
                setIsSubmitting(false);
            }
            setUserReview(data.review);
            setIsSubmitting(false);
            setSubmitError("");
        } catch (err) {
            setSubmitError(err.message || "No se pudo crear la reseña");
            setIsSubmitting(false);
        }
    };

    const handleEditReview = () => {
        if (!userReview) return;

        setRating(userReview.rating);
        setReview(userReview.text);
        setSubmitError("");
        setIsEditing(true);
    };

    const handleUpdateReview = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setSubmitError("");

        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

        try {
            const response = await fetch(`${backendUrl}/api/review`, {
                method: "PUT",
                body: JSON.stringify({ review, rating, album_id: albumData.id }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "No se pudo actualizar la reseña");
            }

            setUserReview(data.review);
            setIsEditing(false);
            setSubmitError("");
        } catch (err) {
            setSubmitError(err.message || "No se pudo actualizar la reseña");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadAlbum = async () => {
            if (!artist || !album) {
                if (!cancelled) {
                    setAlbumData(null);
                    setError("Selecciona un álbum para escribir una reseña");
                    setIsLoading(false);
                }
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const params = new URLSearchParams({ artist, album });
                const response = await fetch(`${backendUrl}/api/lastfm/album?${params.toString()}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo cargar el álbum");
                }

                setAlbumData(data.album || null);
            } catch (err) {
                setAlbumData(null);
                setSubmitError("");
                setError(err.message || "No se pudo cargar el álbum");
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadAlbum();
    }, [artist, album]);

    useEffect(() => {
        let cancelled = false;

        const loadUserReview = async () => {
            if (!albumData?.id) {
                return;
            }

            const token = localStorage.getItem("token");

            if (!externalUserId && !token) {
                if (!cancelled) {
                    setUserReview(null);
                    setIsLoadingReview(false);
                }
                return;
            }

            try {
                if (!cancelled) {
                    setIsLoadingReview(true);
                    setIsEditing(false);
                }

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                // Sin externalUserId: obtiene la reseña del usuario autenticado.
                // Con externalUserId: obtiene la reseña pública de ese usuario.
                const params = new URLSearchParams({
                    album_id: albumData.id,
                    ...(externalUserId && { user_id: externalUserId }),
                });

                const headers = {};
                if (token && !externalUserId) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(
                    `${backendUrl}/api/review?${params.toString()}`,
                    {
                        method: "GET",
                        headers,
                    }
                );
                const data = await response.json();

                if (cancelled) return;

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo cargar la reseña");
                }

                setUserReview(data.review);
            } catch (err) {
                if (cancelled) return;
                setUserReview(null);
            } finally {
                if (!cancelled) {
                    setIsLoadingReview(false);
                }
            }
        };

        loadUserReview();

        // Al desmontar o re-ejecutar el efecto, marca cancelled para ignorar respuestas tardías del fetch
        return () => {
            cancelled = true;
        };
    }, [albumData?.id, externalUserId]);

    const trackCount = albumData?.tracks?.length || 0;
    const tagsLabel = albumData?.tags?.filter(Boolean).join(", ") || "Sin tags";
    const albumDetailLink = artist && album
        ? `/album/${encodeURIComponent(artist)}/${encodeURIComponent(album)}`
        : null;

    return (
        <div className="review-page">
            <div className="review-layout">
                <div className="review-form-column">
                    <div className="audia-panel">
                        {isLoadingReview ? (
                            <p className="text-white">Cargando reseña...</p>
                        ) : userReview && externalUserId && externalUserId !== authenticatedUserId ? (
                            <>
                                <h2 className="h3 mb-2">
                                    Reseña de {userReview.user?.display_name || userReview.user?.username || "Usuario"}
                                </h2>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Calificación</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                style={{ minWidth: "42px", color: userReview.rating >= star ? "#ffd700" : "#666" }}
                                            >
                                                <i className={`fa${userReview.rating >= star ? "s" : "r"} fa-star`}></i>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Reseña</label>
                                    <div
                                        className="form-control"
                                        style={{ backgroundColor: "#98BCFF", color: "#000", borderColor: "#98BCFF", whiteSpace: "pre-wrap", lineHeight: 1.6, minHeight: "12rem" }}
                                    >
                                        {userReview.text}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                                    {albumDetailLink ? (
                                        <Link
                                            to={albumDetailLink}
                                            className="btn px-4"
                                            style={{ backgroundColor: "#0d3b66", color: "#fff", borderColor: "#0d3b66" }}
                                        >
                                            Volver a la información del álbum
                                        </Link>
                                    ) : null}
                                    {artist && album ? (
                                        <Link
                                            to={`/review?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`}
                                            className="btn px-4"
                                            style={{ backgroundColor: "#0d3b66", color: "#fff", borderColor: "#0d3b66" }}
                                        >
                                            Crear tu propia reseña
                                        </Link>
                                    ) : null}
                                </div>
                            </>
                        ) : userReview && !isEditing ? (
                            <>
                                <h2 className="h3 mb-2">Tu reseña</h2>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Calificación</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                style={{ minWidth: "42px", color: userReview.rating >= star ? "#ffd700" : "#666" }}
                                            >
                                                <i className={`fa${userReview.rating >= star ? "s" : "r"} fa-star`}></i>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Tu reseña
                                    </label>
                                    <div
                                        className="form-control"
                                        style={{ backgroundColor: "#98BCFF", color: "#000", borderColor: "#98BCFF", whiteSpace: "pre-wrap", lineHeight: 1.6, minHeight: "12rem" }}
                                    >
                                        {userReview.text}
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-start gap-2">
                                    <button
                                        type="button"
                                        onClick={handleEditReview}
                                        className="btn px-4"
                                        style={{ backgroundColor: "#0d3b66", color: "#fff", borderColor: "#0d3b66" }}
                                    >
                                        Editar reseña
                                    </button>
                                    {albumDetailLink ? (
                                        <Link
                                            to={albumDetailLink}
                                            className="btn px-4"
                                            style={{ backgroundColor: "#0d3b66", color: "#fff", borderColor: "#0d3b66" }}
                                        >
                                            Volver a la información del álbum
                                        </Link>
                                    ) : null}
                                </div>
                            </>
                        ) : userReview && isEditing ? (
                            <div className="">
                                <h2 className="h3 mb-2">Editar tu reseña</h2>
                                <p className="text-white mb-4">
                                    {albumData
                                        ? `Actualiza tu opinión sobre “${albumData.name}” de ${albumData.artist}.`
                                        : "Actualiza tu opinión sobre este álbum."}
                                </p>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Calificación</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`review-star-btn ${rating >= star ? "active" : ""}`}
                                                onClick={() => setRating(star)}
                                                aria-label={`Calificar con ${star} estrellas`}
                                            >
                                                <i className={`fa${rating >= star ? "s" : "r"} fa-star`}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="reviewText" className="form-label fw-semibold">
                                        Tu reseña
                                    </label>
                                    <textarea
                                        id="reviewText"
                                        className="form-control"
                                        rows="8"
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        placeholder="Escribe aquí tu opinión sobre el álbum..."
                                    />
                                </div>

                                <div className="d-flex flex-column align-items-start gap-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        onClick={(e) => handleUpdateReview(e)}
                                        className="btn audia-primary-btn px-4"
                                    >
                                        {isSubmitting ? "Guardando cambios..." : "Guardar cambios"}
                                    </button>
                                    {albumDetailLink ? (
                                        <Link
                                            to={albumDetailLink}
                                            className="btn audia-secondary-btn px-4"
                                        >
                                            Volver a la información del álbum
                                        </Link>
                                    ) : null}
                                </div>
                                {submitError && <p className="text-danger mt-3 mb-0">{submitError}</p>}
                            </div>
                        ) : externalUserId && externalUserId !== authenticatedUserId ? (
                            <>
                                <p className="text-white mb-4">No se encontró la reseña.</p>
                                <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                                    {albumDetailLink ? (
                                        <Link
                                            to={albumDetailLink}
                                            className="btn px-4"
                                            style={{ backgroundColor: "#0d3b66", color: "#fff", borderColor: "#0d3b66" }}
                                        >
                                            Volver a la información del álbum
                                        </Link>
                                    ) : null}
                                    {artist && album ? (
                                        <Link
                                            to={`/review?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`}
                                            className="btn px-4"
                                            style={{ backgroundColor: "#0d3b66", color: "#fff", borderColor: "#0d3b66" }}
                                        >
                                            Crear tu propia reseña
                                        </Link>
                                    ) : null}
                                </div>
                            </>
                        ) : !isLoadingReview && (
                            <div className="">
                                <h2 className="h3 mb-2">Escribir una reseña</h2>
                                <p className="text-white mb-4">
                                    {albumData
                                        ? `Comparte tu opinión sobre “${albumData.name}” de ${albumData.artist}.`
                                        : "Comparte tu opinión sobre este álbum y ayuda a otros oyentes."}
                                </p>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Calificación</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`btn btn-sm ${rating >= star ? "btn-primary" : "btn-outline-primary"}`}
                                                onClick={() => setRating(star)}
                                                aria-label={`Calificar con ${star} estrellas`}
                                                style={{ minWidth: "42px", backgroundColor: rating >= star ? "#0d3b66" : "transparent", borderColor: "#0d3b66", color: rating >= star ? "#fff" : "#0d3b66" }}
                                            >
                                                <i className={`fa${rating >= star ? "s" : "r"} fa-star`}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="reviewText" className="form-label fw-semibold">
                                        Tu reseña
                                    </label>
                                    <textarea
                                        id="reviewText"
                                        className="form-control audia-textarea"
                                        rows="8"
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        placeholder="Escribe aquí tu opinión sobre el álbum..."
                                    />
                                </div>

                                <div className="d-flex flex-column align-items-start gap-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        onClick={(e) => handleCreateReview(e)}
                                        className="btn audia-primary-btn px-4"
                                    >
                                        {isSubmitting ? "Publicando reseña..." : "Publicar reseña"}
                                    </button>
                                    {albumDetailLink ? (
                                        <Link
                                            to={albumDetailLink}
                                            className="btn audia-secondary-btn px-4"
                                        >
                                            Volver a la información del álbum
                                        </Link>
                                    ) : null}
                                </div>
                                {submitError && <p className="text-danger mt-3 mb-0">{submitError}</p>}
                            </div>
                        )}
                    </div>
                </div>


                <div className="review-album-column">
                    <div className="audia-panel p-4">
                        {isLoading ? (
                            <p className="text-white">Cargando álbum...</p>
                        ) : error || !albumData ? (
                            <>
                                <p className="text-white">No se pudo cargar el álbum</p>
                            </>
                        ) : (
                            <>
                                <img
                                    src={albumData.cover || FALLBACK_IMAGE}
                                    alt={albumData.name}
                                    className="rounded w-100 mb-3 border"
                                />

                                <h3 className="h4 mb-2 text-white">
                                    <strong>{albumData.name}</strong>
                                </h3>

                                <p className="text-white mb-1">
                                    Artista: {albumData.artist}
                                </p>

                                <p className="small text-light mb-3">
                                    Tags: {tagsLabel}
                                    {trackCount ? ` · ${trackCount} canciones` : ""}
                                </p>

                                <ul className="list-group list-group-flush">
                                    {trackCount ? (
                                        <li className="list-group-item px-0 bg-transparent text-white">
                                            Canciones: {trackCount}
                                        </li>
                                    ) : null}

                                    {albumData.link ? (
                                        <li className="list-group-item px-0 bg-transparent text-white">
                                            <Link
                                                to={albumData.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn audia-primary-btn"
                                            >
                                                Ver en Last.fm
                                            </Link>
                                        </li>
                                    ) : null}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Review;
