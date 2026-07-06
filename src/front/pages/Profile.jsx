import "../profile.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Profile = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [name, setName] = useState("Juan Diego");

    const [description, setDescription] = useState(
        "La música cuenta historias que las palabras nunca podrían explicar."
    );

    const [profileImage, setProfileImage] = useState(
        "../public/albums/perfil.png"
    );

    const [showEditor, setShowEditor] = useState(false);

    const [newName, setNewName] = useState(name);

    const [newDescription, setNewDescription] = useState(description);

    const [newImage, setNewImage] = useState(profileImage);

    const favoriteAlbums = [
        {
            id: 1,
            title: "After Hours",
            artist: "The Weeknd",
            cover: "../public/albums/1.png"
        },
        {
            id: 2,
            title: "DAMN.",
            artist: "Kendrick Lamar",
            cover: "../public/albums/2.png"
        },
        {
            id: 3,
            title: "Currents",
            artist: "Tame Impala",
            cover: "../public/albums/3.jpg"
        },
        {
            id: 4,
            title: "Random Access Memories",
            artist: "Daft Punk",
            cover: "../public/albums/4.png"
        },
        {
            id: 5,
            title: "Abbey Road",
            artist: "The Beatles",
            cover: "../public/albums/5.jpg"
        },
        {
            id: 6,
            title: "Blonde",
            artist: "Frank Ocean",
            cover: "../public/albums/6.jpeg"
        },
        {
            id: 7,
            title: "Graduation",
            artist: "Kanye West",
            cover: "../public/albums/7.jpg"
        },
        {
            id: 8,
            title: "Discovery",
            artist: "Daft Punk",
            cover: "../public/albums/8.png"
        }
    ];

    const reviews = [
        {
            id: 1,
            album: "After Hours",
            artist: "The Weeknd",
            rating: "★★★★★",
            review:
                "Una producción impecable. Cada canción mantiene una atmósfera increíble.",
            cover: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png"
        },
        {
            id: 2,
            album: "Currents",
            artist: "Tame Impala",
            rating: "★★★★☆",
            review:
                "Uno de los mejores álbumes de rock psicodélico moderno.",
            cover: "../public/albums/3.jpg"
        },
        {
            id: 3,
            album: "Random Access Memories",
            artist: "Daft Punk",
            rating: "★★★★★",
            review:
                "Un clásico moderno con una producción espectacular.",
            cover: "../public/albums/4.png"
        }
    ];
    const saveProfile = () => {

        setName(newName);

        setDescription(newDescription);

        setProfileImage(newImage);

        setShowEditor(false);

    }

    useEffect(() => {
        const loadProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const backendUrl =
                    import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

                const response = await fetch(`${backendUrl}/api/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Sesión inválida");
                }

                setUser(data.user);
                setName(data.user.username);
                setNewName(data.user.username);
            } catch (error) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setError(error.message);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    if (loading) return <p className="profile-status">Cargando perfil...</p>;
    if (error) return <p className="profile-status">{error}</p>;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (

        <div className="profile-page">

            <div className="container py-5">



                <div className="profile-card shadow">

                    <div className="row align-items-center">

                        <div className="col-lg-4 text-center">

                            <img
                                src={profileImage}
                                alt="Perfil"
                                className="profile-picture"
                            />

                        </div>

                        <div className="col-lg-8">

                            <h1 className="profile-name">
                                {name}
                            </h1>

                            <p className="profile-user">
                                @{user?.username}
                            </p>

                            <p className="profile-description">

                                {description}

                            </p>

                            <button
                                className="edit-profile-btn"
                                data-bs-toggle="modal"
                                data-bs-target="#editProfileModal"
                            >
                                Editar Perfil
                            </button>

                            <button
                                type="button"
                                className="logout-btn"
                                onClick={handleLogout}
                            >
                                Cerrar sesión
                            </button>

                            <div className="row text-center mt-4">

                                <div className="col">

                                    <h3>58</h3>

                                    <span>Reseñas</span>

                                </div>

                                <div className="col">

                                    <h3>136</h3>

                                    <span>Seguidores</span>

                                </div>

                                <div className="col">

                                    <h3>94</h3>

                                    <span>Siguiendo</span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>



                <div className="albums-section mt-5">

                    <h2 className="section-title">

                        Álbumes Favoritos

                    </h2>

                    <div className="row">

                        {favoriteAlbums.map((album) => (

                            <div className="col-lg-3 col-md-6 col-sm-6 mb-4"
                                key={album.id}
                            >

                                <div className="album-card">

                                    <div className="album-image-container">

                                        <img
                                            src={album.cover}
                                            alt={album.title}
                                            className="album-image"
                                        />

                                    </div>

                                    <div className="album-info">

                                        <h5>{album.title}</h5>

                                        <p>{album.artist}</p>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>



                <div className="reviews-section mt-5">

                    <h2 className="section-title">

                        Reseñas Recientes

                    </h2>

                    {reviews.map((review) => (

                        <div
                            className="review-card"
                            key={review.id}
                        >

                            <img
                                src={review.cover}
                                alt={review.album}
                                className="review-cover"
                            />

                            <div className="review-info">

                                <h4>{review.album}</h4>

                                <h6>{review.artist}</h6>

                                <p className="stars">

                                    {review.rating}

                                </p>

                                <p>

                                    {review.review}

                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>
            <div
                className="modal fade"
                id="editProfileModal"
                tabIndex="-1"
                aria-hidden="true"
            >

                <div className="modal-dialog">

                    <div className="modal-content">

                        <div className="modal-header">

                            <h5 className="modal-title">

                                Editar Perfil

                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            ></button>

                        </div>

                        <div className="modal-body">

                            <label>Foto de perfil</label>

                            <input
                                className="form-control mb-3"
                                type="file"
                                accept="image/*"
                            />

                            <label>Nombre</label>

                            <input
                                className="form-control mb-3"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />

                            <label>Descripción</label>

                            <textarea
                                className="form-control"
                                rows="4"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            ></textarea>

                        </div>

                        <div className="modal-footer">

                            <button
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >

                                Cancelar

                            </button>

                            <button
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={saveProfile}
                            >

                                Guardar Cambios

                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </div>

    );

};