import React from "react";

export const Navbar = () => {
  return (
    <header className="navbar">
      <h1 className="logo">Audia</h1>

      <div className="navbar-right">
        <nav>
          <a href="#ulti">Últimos lanzamientos</a>
          <a href="#">Géneros</a>
          <a href="#">Random Pick</a>
        </nav>

        <a href="/login" className="user-link">Iniciar sesión</a>
        <a href="/" className="user-link"><img src="" alt="" /></a>
      </div>
    </header>
  );
};