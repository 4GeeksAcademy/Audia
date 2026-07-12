import React from "react";


export const Home = () => {

  const albums = [
    {
      title: "With Heaven on Top",
      artist: "Zach Bryan",
      year: "2026",
      image: "/albums/with-heaven-on-top.jpg",
    },
    {
      title: "Don't Be Dumb",
      artist: "A$AP Rocky",
      year: "2026",
      image: "/albums/dont-be-dumb.jpg",
    },
    {
      title: "Octane",
      artist: "Don Toliver",
      year: "2026",
      image: "/albums/octane.png",
    },
    {
      title: "The Fall-Off",
      artist: "J. Cole",
      year: "2026",
      image: "/albums/the-fall-off.jpg",
    },
    {
      title: "Cloud 9",
      artist: "Megan Moroney",
      year: "2026",
      image: "/albums/cloud-9.jpg",
    },
    {
      title: "Victory",
      artist: "Madeon",
      year: "2026",
      image: "/albums/victory.jpg",
    },
    {
      title: "The Ground Above",
      artist: "Beth Orton",
      year: "2026",
      image: "/albums/the-ground-above.jpg",
    },
    {
      title: "Your Day Will Come",
      artist: "Chanel Beads",
      year: "2026",
      image: "/albums/your-day-will-come.jpg",
    },
  ];

  const latestAlbums = [
    {
      title: "MM..FOOD (20th Anniversary)",
      artist: "MF DOOM",
      image: "/albums/mm-food.jpg",
      day: "9",
      month: "MAY",
      rating: "4.6",
    },
    {
      title: "MAYHEM",
      artist: "Lady Gaga",
      image: "/albums/mayhem.jpg",
      day: "8",
      month: "MAY",
      rating: "3.8",
    },
    {
      title: "So Much For (Sub)Urban Glory",
      artist: "Zack Fox",
      image: "/albums/so-much-for.jpg",
      day: "7",
      month: "MAY",
      rating: "4.0",
    },
    {
      title: "I Said I Love You First",
      artist: "Selena Gomez & Benny Blanco",
      image: "/albums/i-said-i-love-you-first.jpg",
      day: "6",
      month: "MAY",
      rating: "4.1",
    },
  ];

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
            <a href="/ultimos-lanzamientos" className="primary-btn">
              Explorar álbumes
            </a>

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
            <h2>Tendencias en Audia</h2>
          </div>

          <a href="#">Ver todos</a>
        </div>

        <div className="album-carousel">
          {albums.map((album) => (
            <a href={`/album/${album.title}`} className="album-card" key={album.title}>
              <img src={album.image} alt={`Portada de ${album.title}`} />

              <div className="album-card-info">
                <h3>{album.title}</h3>
                <p>{album.artist}</p>

                <div className="album-rating">
                  <span>★★★★★</span>
                  <p>4.3</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="album-section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Novedades musicales</p>
            <h2>Últimos lanzamientos</h2>
          </div>

          <a href="/ultimos-lanzamientos">Ver todos</a>
        </div>

        <div className="album-carousel">
          {albums.map((album) => (
            <a href={`/album/${album.title}`} className="album-card release-card" key={`release-${album.title}`}>
              <div className="release-cover">
                <img src={album.image} alt={`Portada de ${album.title}`} />

                <div className="release-date">
                  <strong>{album.day}</strong>
                  <span>{album.month}</span>
                </div>
              </div>

              <div className="album-card-info">
                <h3>{album.title}</h3>
                <p>{album.artist}</p>

                <div className="album-rating">
                  <span>★★★★★</span>
                  <p>{album.rating}</p>
                </div>
              </div>
            </a>
          ))}
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