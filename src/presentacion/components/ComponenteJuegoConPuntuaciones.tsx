import React, { useEffect, useRef, useState } from "react";
import { useJuegoConPuntuaciones } from "../hooks/useJuegoConPuntuaciones";
import { useCanvasRenderer } from "../hooks/useCanvasRenderer";
import { useGameDependencies } from "../context/GameContext";

type Props = { ancho?: number; alto?: number };

export default function JuegoConPuntuaciones({
  ancho = 800,
  alto = 700,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  const { repo, gen } = useGameDependencies();

  const {
    estadoRef,
    puntuacion,
    gameOver,
    iniciar,
    reiniciar,
    puntuaciones,
    cargando,
    error,
  } = useJuegoConPuntuaciones(ancho, alto, 10, repo, gen);

  useCanvasRenderer(canvasRef, estadoRef, ancho, alto, juegoIniciado);

  useEffect(() => {
    if (!juegoIniciado) return;
    const t = setTimeout(() => canvasRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [juegoIniciado]);

  return (
    <div className="container text-center mt-4">
      {/* Header decorado */}
      <header className="mb-4">
        <h1 className="display-4 fw-bold animate__animated animate__fadeInDown">
          <span style={{ marginRight: 8 }}>🚀</span>
          Galaga <span className="text-danger">Clean Architecture</span>
        </h1>
        <p className="lead text-muted">
          Un clásico reinventado. Dispara, esquiva y alcanza la cima del
          ranking.
        </p>
      </header>

      {/* Contenedor del juego (canvas centrado) */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={ancho}
          height={alto}
          className="border border-dark shadow-lg rounded d-block mx-auto"
          style={{ background: "#0b1220" }}
        />

        {/* Botón centrado sobre el canvas (antes de iniciar) */}
        {!juegoIniciado && (
          <button
            className="btn btn-primary btn-lg shadow animate__animated animate__pulse"
            style={{
              position: "absolute",
              top: "48%",
              left: "38%",
              transform: "translate(-50%, -50%)",
              minWidth: 180,
            }}
            onClick={() => {
              setJuegoIniciado(true);
              try {
                iniciar();
              } catch (e) {
                console.error("Error iniciando juego:", e);
              }
            }}
          >
            🚀 Empezar Juego
          </button>
        )}

        {/* Overlay de Game Over / Victoria — ahora dentro del contenedor del juego */}
        {gameOver && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.65)",
              zIndex: 9999,
              borderRadius: "0.5rem", // coincide con el canvas rounded
            }}
          >
            <div
              className="bg-dark text-white p-4 rounded shadow-lg animate__animated animate__zoomIn"
              style={{ width: "90%", maxWidth: 480, textAlign: "center" }}
            >
              <h2 className="mb-2">
                {gameOver.tipo === "derrota" ? "💀 Game Over" : "🏆 ¡Victoria!"}
              </h2>
              <p className="mb-2">{gameOver.mensaje}</p>
              <p className="fw-bold mb-3">Puntuación final: {puntuacion}</p>
              <div className="d-flex gap-3 justify-content-center">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setJuegoIniciado(true);
                    reiniciar();
                  }}
                >
                  Reiniciar
                </button>
                <button
                  className="btn btn-outline-light"
                  onClick={() => window.location.reload()}
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de puntuaciones: mostrar siempre, pero su contenido depende de cargando/error */}
      <div className="mt-5">
        <h3 className="fw-bold text-center mb-3">🏅 Top 10</h3>

        {cargando && <p className="text-center text-muted">Cargando...</p>}
        {error && <p className="text-center text-danger">Error: {error}</p>}

        {!cargando && !error && (
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: 60 }}>Pos</th>
                  <th>Jugador</th>
                  <th style={{ width: 120 }}>Puntos</th>
                  <th style={{ width: 200 }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {puntuaciones.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.nombreUsuario}</td>
                    <td>{p.valorPuntuacion}</td>
                    <td>{new Date(p.fechaRegistro).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección decorativa inferior */}
      <section className="mt-5">
        <div className="row gy-4">
          <div className="col-md-4">
            <div className="p-4 bg-light rounded shadow-sm h-100 text-start">
              <i className="bi bi-joystick display-5 text-primary"></i>
              <h6 className="mt-3 fw-semibold">Controles sencillos</h6>
              <p className="mb-0">
                Flechas para mover, espacio para disparar. ¡Listo para jugar!
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-light rounded shadow-sm h-100 text-start">
              <i className="bi bi-lightning-fill display-5 text-warning"></i>
              <h6 className="mt-3 fw-semibold">Power-ups</h6>
              <p className="mb-0">
                Mejoras temporales que aumentan tu poder de fuego.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-light rounded shadow-sm h-100 text-start">
              <i className="bi bi-trophy-fill display-5 text-success"></i>
              <h6 className="mt-3 fw-semibold">Compite por el Top</h6>
              <p className="mb-0">
                Guarda tu puntuación y compite por el ranking global.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
