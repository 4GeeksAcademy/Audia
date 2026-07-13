import "../profile.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
    "https://static.vecteezy.com/system/resources/thumbnails/052/706/218/small/vibrant-green-cucumber-with-fresh-texture-png.png";


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
        "/albums/perfil.jpg"
    );

    const [showEditor, setShowEditor] = useState(false);

    const [newName, setNewName] = useState(name);

    const [newDescription, setNewDescription] = useState(description);

    const [newImage, setNewImage] = useState(profileImage);

    const [selectedImage, setSelectedImage] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState("");

    const favoriteAlbums = [
        {
            id: 1,
            title: "After Hours",
            artist: "The Weeknd",
            cover: "/albums/1.png"
        },
        {
            id: 2,
            title: "DAMN.",
            artist: "Kendrick Lamar",
            cover: "/albums/2.png"
        },
        {
            id: 3,
            title: "Currents",
            artist: "Tame Impala",
            cover: "/albums/3.jpg"
        },
        {
            id: 4,
            title: "Random Access Memories",
            artist: "Daft Punk",
            cover: "/albums/4.png"
        },
        {
            id: 5,
            title: "Abbey Road",
            artist: "The Beatles",
            cover: "/albums/5.jpg"
        },
        {
            id: 6,
            title: "Blonde",
            artist: "Frank Ocean",
            cover: "/albums/6.jpeg"
        },
        {
            id: 7,
            title: "Graduation",
            artist: "Kanye West",
            cover: "/albums/7.jpg"
        },
        {
            id: 8,
            title: "Discovery",
            artist: "Daft Punk",
            cover: "/albums/8.png"
        }
    ];

    const saveProfile = async () => {
        try {
            setError("");

            const backendUrl =
                import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

            const token = localStorage.getItem("token");
            let imageUrl = newImage;

            if (selectedImage) {
                const formData = new FormData();
                formData.append("image", selectedImage);

                const uploadResponse = await fetch(
                    `${backendUrl}/api/profile/image`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
                    }
                );

                const uploadData = await uploadResponse.json();

                if (!uploadResponse.ok) {
                    throw new Error(
                        uploadData.error || "No se pudo subir la imagen"
                    );
                }

                imageUrl = `${backendUrl}${uploadData.image_path}`;
            }

            const response = await fetch(`${backendUrl}/api/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    display_name: newName,
                    description: newDescription,
                    profile_image: imageUrl
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "No se pudo actualizar el perfil"
                );
            }

            setUser(data.user);
            setName(data.user.display_name);
            setDescription(data.user.description);
            setProfileImage(data.user.profile_image);
            setNewImage(data.user.profile_image);
            setSelectedImage(null);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        } catch (error) {
            setError(error.message);
        }
    };

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
                const loadedName =
                    data.user.display_name || data.user.username;

                setName(loadedName);
                setNewName(loadedName);

                setDescription(data.user.description || "");
                setNewDescription(data.user.description || "");

                const loadedImage =
                    data.user.profile_image || "/albums/perfil.jpg";

                setProfileImage(loadedImage);
                setNewImage(loadedImage);

                try {
                    const reviewsResponse = await fetch(
                        `${backendUrl}/api/reviews`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const reviewsData = await reviewsResponse.json();

                    if (!reviewsResponse.ok) {
                        throw new Error(
                            reviewsData.error || "No se pudieron cargar las reseñas"
                        );
                    }

                    setReviews(reviewsData.reviews || []);
                } catch (reviewsErr) {
                    setReviewsError(reviewsErr.message);
                }

            } catch (error) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setError(error.message);
                navigate("/login");
            } finally {
                setLoading(false);
                setReviewsLoading(false);
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
                                src={profileImage || "/albums/perfil.jpg"}
                                alt="Foto de perfil"
                                className="profile-avatar"
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

                                    <h3>{reviews.length}</h3>

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

                    {reviewsLoading ? (
                        <p className="profile-status">Cargando reseñas...</p>
                    ) : reviewsError ? (
                        <p className="profile-status">{reviewsError}</p>
                    ) : reviews.length === 0 ? (
                        <p className="profile-status">
                            Aún no has publicado reseñas.
                        </p>
                    ) : (
                        reviews.map((review) => {
                            const reviewPath = `/review?artist=${encodeURIComponent(review.artist)}&album=${encodeURIComponent(review.album)}`;

                            return (
                                <Link
                                    className="review-card"
                                    key={review.id}
                                    to={reviewPath}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.03)";
                                        e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                                    }}
                                >
                                    <img
                                        src={review.cover || FALLBACK_IMAGE}
                                        alt={review.album}
                                        className="review-cover"
                                        onError={(e) => {
                                            e.target.src = FALLBACK_IMAGE;
                                        }}
                                    />

                                    <div className="review-info">
                                        <h4>{review.album}</h4>
                                        <h6>{review.artist}</h6>
                                        <p className="stars">
                                            {"★".repeat(review.rating)}
                                        </p>
                                        <p>{review.text}</p>
                                    </div>
                                </Link>
                            );
                        })
                    )}

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
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(event) => {
                                    const file = event.target.files[0];

                                    if (file) {
                                        setSelectedImage(file);
                                    }
                                }}
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