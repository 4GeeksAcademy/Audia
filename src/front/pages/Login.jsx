import React from "react";

export const Login = () => {
  return (
    <main className="login-page">
      <section className="login-card">
        <h2>Iniciar sesión</h2>
        <p>Entra a tu cuenta para guardar reseñas, listas y álbumes favoritos.</p>

        <form className="login-form">
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

        <p className="login-register">
          ¿No tienes cuenta? <a href="#">Crear cuenta</a>
        </p>
      </section>
    </main>
  );
};