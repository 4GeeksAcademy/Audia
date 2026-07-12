import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export const AlbumDetail = () => {
    const { artist, album } = useParams();
    const [albumData, setAlbumData] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAlbum = async () => {
            if (!artist?.trim() || !album?.trim()) {
                setAlbumData(null);
                setError("Faltan datos del álbum para cargar el detalle");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const params = new URLSearchParams({
                    artist: artist.trim(),
                    album: album.trim(),
                });
                const response = await fetch(`${backendUrl}/api/lastfm/album?${params.toString()}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo cargar el álbum");
                }

                setAlbumData(data.album || null);
                console.log("Data del álbum:", data.album);
            } catch (err) {
                setAlbumData(null);
                setError(err.message || "No se pudo cargar el álbum");
            } finally {
                setIsLoading(false);
            }
        };

        loadAlbum();
    }, [artist, album]);

    if (isLoading) {
        return <div className="album-detail-page"><p>Cargando álbum...</p></div>;
    }

    if (error || !albumData) {
        return <div className="album-detail-page"><p>{error || "No se encontró el álbum"}</p><Link to="/">Volver a Inicio</Link></div>;
    }
    const fallbackImage = "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";

    return (
        <div className="album-detail-page">
            <Link className="back-link" to="/">← Volver</Link>
            <div className="album-detail-card">
                <div className="d-flex flex-column gap-3">
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
                            Haz una reseña
                        </Link>
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
