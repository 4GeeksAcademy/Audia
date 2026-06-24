import React from "react";

export const Navbar = () => {
  return (
    <header className="navbar">
      <h1 className="logo">Audia</h1>

      <div className="navbar-right">
        <nav>
          <a href="#">Últimos lanzamientos</a>
          <a href="#">Géneros</a>
          <a href="#">Random Pick</a>
        </nav>

        <a href="/login" className="user-link">Iniciar sesión</a>
      </div>
    </header>
  );
};