import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

     try {
      const response = await fetch(`/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear la cuenta");
      }
      
      console.log("Registro exitoso:", data);
      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-eyebrow">Únete a Audia</p>
        <h2>Crear cuenta</h2>
        <p className="auth-copy">
          Empieza a reseñar álbumes, guardar favoritos y descubrir música con la comunidad.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nombre de usuario
            <input
              type="text"
              placeholder="tu_usuario"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              placeholder="Crea una contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength="8"
              required
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength="8"
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}> {loading ? "Creando cuenta..." : "Crear cuenta"}</button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta?  <Link to="/login">Iniciar sesión</Link>
        </p>
      </section>
    </main>
  );
};