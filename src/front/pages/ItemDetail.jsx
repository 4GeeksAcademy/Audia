import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export const ItemDetail = () => {
    const { itemType, itemId } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadItem = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
                const response = await fetch(`${backendUrl}/api/reccobeats/item/${encodeURIComponent(itemType || "album")}/${encodeURIComponent(itemId || "")}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "No se pudo cargar el contenido");
                }

                setItem(data[itemType] || data.album || data.artist || null);
            } catch (err) {
                setError(err.message || "No se pudo cargar el contenido");
            } finally {
                setIsLoading(false);
            }
        };

        loadItem();
    }, [itemId, itemType]);

    if (isLoading) {
        return <div className="album-detail-page"><p>Cargando...</p></div>;
    }

    if (error || !item) {
        return <div className="album-detail-page"><p>{error || "No se encontró el contenido"}</p><Link to="/">Volver a Inicio</Link></div>;
    }

    const isArtist = itemType === "artist";

    return (
        <div className="album-detail-page">
            <Link className="back-link" to="/">← Volver</Link>
            <div className="album-detail-card">
                <img src={item.cover || item.image || "/albums/default.jpg"} alt={item.name} />
                <div>
                    <p className="album-detail-label">{isArtist ? "Artista" : "Álbum"}</p>
                    <h1>{item.name}</h1>
                    {item.artist ? <p>{item.artist}</p> : null}
                    {item.artists?.length ? <p>{item.artists.join(", ")}</p> : null}
                    {item.year ? <p>Año: {item.year}</p> : null}
                    {item.genres?.length ? <p>Géneros: {item.genres.join(", ")}</p> : null}
                </div>
            </div>
        </div>
    );
};
