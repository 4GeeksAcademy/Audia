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
      title: "BRAT",
      artist: "Charli XCX",
      year: "2024",
      image: "/albums/brat.jpg",
    },
    {
      title: "Hit Me Hard and Soft",
      artist: "Billie Eilish",
      year: "2024",
      image: "/albums/hit-me-hard-and-soft.png",
    },
    {
      title: "Cowboy Carter",
      artist: "Beyoncé",
      year: "2024",
      image: "/albums/cowboy-carter.jpg",
    },
    {
      title: "The Tortured Poets Department",
      artist: "Taylor Swift",
      year: "2024",
      image: "/albums/tortured-poets.jpg",
    },
    {
      title: "Charm",
      artist: "Clairo",
      year: "2024",
      image: "/albums/charm.jpg",
    },
    {
      title: "Imaginal Disk",
      artist: "Magdalena Bay",
      year: "2024",
      image: "/albums/imaginal-disk.jpg",
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
          <div>
            <p className="section-eyebrow">Explora la comunidad</p>
            <h2>Últimos lanzamientos</h2>
          </div>

          <a href="#">Ver todos</a>
        </div>

        <div className="album-carousel">
          {albums.map((album) => (
            <a href="#" className="album-card" key={album.title}>
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