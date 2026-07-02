import React from "react";

export const Navbar = () => {
  return (
    <header className="navbar">
      <a href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
        <h1 className="logo">Audia</h1>
      </a>

      <div className="navbar-right">
        <nav>
          <a href="#ulti">Últimos lanzamientos</a>
          <a href="#">Géneros</a>
          <a href="#">Random Pick</a>
          <a href="/review">Reseñas</a>
        </nav>

        <a href="/Login" className="user-link">Iniciar sesión</a>
        <a href="/Profile" className="user-link">Perfil</a>
      </div>
    </header>
  );
};