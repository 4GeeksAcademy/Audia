//import React, { useEffect } from "react"
//import rigoImageUrl from "../assets/img/rigo-baby.jpg";
//import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// export const Home = () => {

// 	const { store, dispatch } = useGlobalReducer()

// 	const loadMessage = async () => {
// 		try {
// 			const backendUrl = import.meta.env.VITE_BACKEND_URL

// 			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

// 			const response = await fetch(backendUrl + "/api/hello")
// 			const data = await response.json()

// 			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

// 			return data

// 		} catch (error) {
// 			if (error.message) throw new Error(
// 				`Could not fetch the message from the backend.
// 				Please check if the backend is running and the backend port is public.`
// 			);
// 		}

// 	}

// 	useEffect(() => {
// 		loadMessage()
// 	}, [])

// 	return (
// 		<div className="text-center mt-5">
// 			<h1 className="display-4">Hello Rigo!!</h1>
// 			<p className="lead">
// 				<img src={rigoImageUrl} className="img-fluid rounded-circle mb-3" alt="Rigo Baby" />
// 			</p>
// 			<div className="alert alert-info">
// 				{store.message ? (
// 					<span>{store.message}</span>
// 				) : (
// 					<span className="text-danger">
// 						Loading message from the backend (make sure your python 🐍 backend is running)...
// 					</span>
// 				)}
// 			</div>
// 		</div>
// 	);
// }; 

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
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h2>¡Revolver cumple 60 años!</h2>
          <p>
            Celebra el aniversario de este clásico leyendo las reseñas de los usuarios
          </p>
          <a href="#" className="hero-button">Ir a las reseñas</a>
        </div>
      </section>

      <section className="album-section">
        <div className="section-header">
          <div id = "ulti">
            <p className="section-eyebrow">Explora la comunidad</p>
            <h2>Últimos lanzamientos</h2>
          </div>

          <a href="#">Ver todos</a>
        </div>

        <div className="album-carousel">
          {albums.map((album) => (
            <a href={`/album/${album.id}`} className="album-card" key={album.title}>
              <img src={album.image} alt={`Portada de ${album.title}`} />

              <div className="album-card-info">
                <h3>{album.title}</h3>
                <p>{album.artist}</p>
                <span>{album.year}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
};