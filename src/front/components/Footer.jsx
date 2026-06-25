import React from "react";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Audia</h3>
        <p>Descubre, califica y comparte tus álbumes favoritos.</p>

        <nav className="footer-links">
          <a href="#">Inicio</a>
          <a href="#">Explorar</a>
          <a href="#">Listas</a>
          <a href="#">Contacto</a>
        </nav>

        <p className="footer-copy">
          © 2026 MusicBoxd. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};