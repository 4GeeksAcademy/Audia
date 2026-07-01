import React from "react";

const albums = [
    {
        title: "With Heaven on Top",
        artist: "Zach Bryan",
        year: "2026",
        genre: "Country",
        image: "/albums/with-heaven-on-top.jpg",
    },
    {
        title: "Don't Be Dumb",
        artist: "A$AP Rocky",
        year: "2026",
        genre: "Hip-hop",
        image: "/albums/dont-be-dumb.jpg",
    },
    {
        title: "Octane",
        artist: "Don Toliver",
        year: "2026",
        genre: "R&B",
        image: "/albums/octane.jpg",
    },
    {
        title: "The Fall-Off",
        artist: "J. Cole",
        year: "2026",
        genre: "Hip-hop",
        image: "/albums/the-fall-off.jpg",
    },
    {
        title: "Cloud 9",
        artist: "Megan Moroney",
        year: "2026",
        genre: "Country pop",
        image: "/albums/cloud-9.jpg",
    },
    {
        title: "Victory",
        artist: "Madeon",
        year: "2026",
        genre: "Electronic",
        image: "/albums/victory.jpg",
    },
];

export const LatestReleases = () => {
    return (
        <main className="releases-page">
            <section className="releases-header">
                <p className="section-eyebrow">Explora música nueva</p>
                <h1>Últimos lanzamientos</h1>
                <p>
                    Descubre álbumes recientes, guarda tus favoritos y lee reseñas de la comunidad.
                </p>
            </section>

            <section className="release-filters">
                <button>Todos</button>
                <button>Pop</button>
                <button>Hip-hop</button>
                <button>Rock</button>
                <button>Alternativo</button>
                <button>Electrónica</button>
            </section>

            <section className="releases-grid">
                {albums.map((album) => (
                    <a href="#" className="release-card" key={album.title}>
                        <div className="release-cover">
                            <img src={album.image} alt={`Portada de ${album.title}`} />
                        </div>

                        <div className="release-card-info">
                            <h2>{album.title}</h2>
                            <p>{album.artist}</p>
                            <span>{album.year} · {album.genre}</span>
                        </div>
                    </a>
                ))}
            </section>
        </main>
    );
};