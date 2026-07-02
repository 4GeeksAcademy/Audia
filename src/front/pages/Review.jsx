import React, { useState } from "react";

const Review = () => {
    const [rating, setRating] = useState(0);

    return (
        <div className="container py-5">
            <div className="row g-4 align-items-start">
                <div className="col-lg-7">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h2 className="h3 mb-2">Escribir una reseña</h2>
                            <p className="text-muted mb-4">
                                Comparte tu opinión sobre este álbum y ayuda a otros oyentes.
                            </p>

                            <div className="mb-4">
                                <label className="form-label fw-semibold">Calificación</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`btn btn-sm ${rating >= star ? "btn-warning" : "btn-outline-warning"}`}
                                            onClick={() => setRating(star)}
                                            aria-label={`Calificar con ${star} estrellas`}
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
                                />
                            </div>

                            <button type="button" className="btn btn-primary px-4">
                                Publicar reseña
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4">
                            <div
                                className="bg-light rounded d-flex align-items-center justify-content-center mb-3"
                                style={{ height: "220px" }}
                            >
                                <span className="text-muted">Portada del álbum</span>
                            </div>

                            <h3 className="h4 mb-2">Midnight Echoes</h3>
                            <p className="text-muted mb-1">Luna Vega</p>
                            <p className="small text-muted mb-3">2024 · Indie Pop · 12 canciones</p>

                            <ul className="list-group list-group-flush">
                                <li className="list-group-item px-0">Género: Indie Pop</li>
                                <li className="list-group-item px-0">Duración: 38 min</li>
                                <li className="list-group-item px-0">Sello: Nova Records</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Review;

