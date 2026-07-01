import React from "react";

export const Navbar = () => {
  return (
    <header className="navbar">
      <h1 className="logo">Audia</h1>

      <div className="navbar-right">
        <nav>
          <a href="/ultimos-lanzamientos">Últimos lanzamientos</a>
          <a href="#">Géneros</a>
          <a href="#">Random Pick</a>
        </nav>

        <a href="/Login" className="user-link">Iniciar sesión</a>
        <a href="/Profile" className="user-link">Perfil</a>
      </div>
    </header>
  );
};