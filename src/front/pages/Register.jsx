import React, { useState } from "react";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-eyebrow">Únete a Audia</p>
        <h2>Crear cuenta</h2>
        <p className="auth-copy">
          Empieza a reseñar álbumes, guardar favoritos y descubrir música con la comunidad.
        </p>

        <form className="auth-form">
          <label>
            Nombre de usuario
            <input
              type="text"
              placeholder="tu_usuario"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              placeholder="Crea una contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>

          <button type="submit">Crear cuenta</button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a>
        </p>
      </section>
    </main>
  );
};