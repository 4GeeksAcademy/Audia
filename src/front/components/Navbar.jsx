import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
  const savedUser = localStorage.getItem("user");

  try {
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, [location.pathname]);

  return (
    <header className="navbar">
      <Link
        to="/"
        className="logo"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <h1>Audia</h1>
      </Link>

      <div className="navbar-right">
        <nav>
          <Link to="/ultimos-lanzamientos">Últimos lanzamientos</Link>
          <Link to="/generos">Géneros</Link>
          <Link to="/random-pick">Random Pick</Link>
          <Link to="/review">Reseñas</Link>
        </nav>

        <Link
          to={user ? "/profile" : "/login"}
          className="user-link"
        >
          {user ? user.username : "Iniciar sesión"}
        </Link>
      </div>
    </header>
  );
};