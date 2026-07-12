import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const FALLBACK_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";

const Review = () => {
    const [searchParams] = useSearchParams();
    const artist = searchParams.get("artist")?.trim() || "";
    const album = searchParams.get("album")?.trim() || "";

    const [albumData, setAlbumData] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const loadAlbum = async () => {
            if (!artist || !album) {
                setAlbumData(null);
                setError("Selecciona un álbum para escribir una reseña");
                setIsLoading(false);
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
                setError(err.message || "No se pudo cargar el álbum");
            } finally {
                setIsLoading(false);
            }
        };

        loadAlbum();
    }, [artist, album]);

    const trackCount = albumData?.tracks?.length || 0;
    const tagsLabel = albumData?.tags?.filter(Boolean).join(", ") || "Sin tags";

    return (
        <div className="container py-5">
            <div className="row g-4 align-items-start">
                <div className="col-lg-7">
                    <div className="shadow-sm border-0" style={{ backgroundColor: "transparent" }}>
                        <div className="p-4">
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
                                    className="form-control"
                                    rows="8"
                                    placeholder="Escribe aquí tu opinión sobre el álbum..."
                                    style={{ backgroundColor: "#98BCFF", color: "#000", borderColor: "#98BCFF" }}
                                />
                            </div>

                            <button type="button" className="btn px-4" style={{ backgroundColor: "#0d3b66", color: "#fff", borderColor: "#0d3b66" }}>
                                Publicar reseña
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="h-100 p-4 rounded-4" style={{ backgroundColor: "transparent" }}>
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
                                    style={{ borderColor: "#cfe2ff" }}
                                />

                                <h3 className="h4 mb-2 text-white"><strong>{albumData.name}</strong></h3>
                                <p className="text-white mb-1">Artista: {albumData.artist}</p>
                                <p className="small text-light mb-3">
                                   Tags: {tagsLabel}{trackCount ? ` · ${trackCount} canciones` : ""}
                                </p>

                                <ul className="list-group list-group-flush">
                                    {trackCount ? (
                                        <li className="list-group-item px-0 bg-transparent text-white">Canciones: {trackCount}</li>
                                    ) : null}
                                    {albumData.link ? (
                                        <li className="list-group-item px-0 bg-transparent text-white">
                                            <Link to={albumData.link} target="_blank" rel="noreferrer" className="btn btn-light">
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
