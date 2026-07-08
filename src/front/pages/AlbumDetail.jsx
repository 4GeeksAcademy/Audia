import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export const AlbumDetail = () => {
    const { albumId } = useParams();
    const [album, setAlbum] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAlbum = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const response = await fetch(`${backendUrl}/api/reccobeats/album/${encodeURIComponent(albumId)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo cargar el álbum");
                }

                setAlbum(data.album || null);
            } catch (err) {
                setError(err.message || "No se pudo cargar el álbum");
            } finally {
                setIsLoading(false);
            }
        };

        loadAlbum();
    }, [albumId]);

    if (isLoading) {
        return <div className="album-detail-page"><p>Cargando álbum...</p></div>;
    }

    if (error || !album) {
        return <div className="album-detail-page"><p>{error || "No se encontró el álbum"}</p><Link to="/">Volver a Inicio</Link></div>;
    }

    return (
        <div className="album-detail-page">
            <Link className="back-link" to="/">← Volver</Link>
            <div className="album-detail-card">
                <img src={album.cover || album.image || "/albums/default.jpg"} alt={album.name} />
                <div>
                    <p className="album-detail-label">Álbum</p>
                    <h1>{album.name}</h1>
                    <p>{album.artist || (album.artists || []).join(", ")}</p>
                    {album.year ? <p>Año: {album.year}</p> : null}
                    {album.genres?.length ? <p>Géneros: {album.genres.join(", ")}</p> : null}
                </div>
            </div>
        </div>
    );
};
