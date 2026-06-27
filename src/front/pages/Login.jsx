import React from "react";

export const Login = () => {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h2>Iniciar sesión</h2>
        <p>Entra a tu cuenta para guardar reseñas, listas y álbumes favoritos.</p>

        <form className="auth-form">
          <label>
            Correo electrónico
            <input type="email" placeholder="tu@email.com" />
          </label>

          <label>
            Contraseña
            <input type="password" placeholder="Tu contraseña" />
          </label>

          <button type="submit">Entrar</button>
        </form>

        <p className="auth-switch">
          ¿No tienes cuenta? <a href="/Register">Crear cuenta</a>
        </p>
      </section>
    </main>
  );
};