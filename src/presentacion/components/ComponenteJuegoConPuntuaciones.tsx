import React, { useEffect, useRef, useState } from "react";
import { useJuegoConPuntuaciones } from "../hooks/useJuegoConPuntuaciones";

type Props = { ancho?: number; alto?: number };

export default function JuegoConPuntuaciones({
  ancho = 800,
  alto = 700,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  const {
    estadoRef,
    puntuacion,
    gameOver,
    reiniciar,
    puntuaciones,
    cargando,
    error,
  } = useJuegoConPuntuaciones(ancho, alto, 10);

  useEffect(() => {
    if (!juegoIniciado) return;

    let raf = 0;
    function renderLoop() {
      const estado = estadoRef.current;
      const canvas = canvasRef.current;
      if (!estado || !canvas) {
        raf = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fondo
      ctx.clearRect(0, 0, ancho, alto);
      ctx.fillStyle = "#cedeffff"; // fondo oscuro para contraste
      ctx.fillRect(0, 0, ancho, alto);

      // Opcional: efecto de estrellas de fondo (sutil)
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let i = 0; i < 30; i++) {
        const x = (i * 97) % ancho;
        const y = (i * 53) % alto;
        ctx.fillRect(x, y, 1, 1);
      }

      // NAVE
      if (estado.nave.spriteUrl) {
        const naveImg = new Image();
        naveImg.src = estado.nave.spriteUrl;
        // dibujar cuando cargue (no bloquear)
        if (naveImg.complete) {
          ctx.drawImage(
            naveImg,
            estado.nave.posicion.x,
            estado.nave.posicion.y,
            estado.nave.tamaño.ancho,
            estado.nave.tamaño.alto
          );
        } else {
          naveImg.onload = () =>
            ctx.drawImage(
              naveImg,
              estado.nave.posicion.x,
              estado.nave.posicion.y,
              estado.nave.tamaño.ancho,
              estado.nave.tamaño.alto
            );
        }
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          estado.nave.posicion.x,
          estado.nave.posicion.y,
          estado.nave.tamaño.ancho,
          estado.nave.tamaño.alto
        );
      }

      // ENEMIGOS
      for (const e of estado.enemigos) {
        if (e.spriteUrl) {
          const img = new Image();
          img.src = e.spriteUrl;
          if (img.complete) {
            ctx.drawImage(
              img,
              e.posicion.x,
              e.posicion.y,
              e.tamaño.ancho,
              e.tamaño.alto
            );
          } else {
            img.onload = () =>
              ctx.drawImage(
                img,
                e.posicion.x,
                e.posicion.y,
                e.tamaño.ancho,
                e.tamaño.alto
              );
          }
        } else {
          ctx.fillStyle =
            e.tipo === "basico"
              ? "#00f5ff"
              : e.tipo === "rapido"
              ? "#ff9f1c"
              : "#ff4d6d";
          ctx.fillRect(
            e.posicion.x,
            e.posicion.y,
            e.tamaño.ancho,
            e.tamaño.alto
          );
        }
      }

      // PROYECTILES
      for (const p of estado.proyectiles) {
        ctx.beginPath();
        ctx.fillStyle = "#97152bff";
        ctx.arc(p.posicion.x, p.posicion.y, p.radio, 0, Math.PI * 2);
        ctx.fill();
      }

      // UI (arriba a la izquierda)
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(`Puntos: ${estado.puntuacion}`, 12, 22);
      ctx.fillText(`Vida: ${estado.nave.vida}`, 12, 44);

      raf = requestAnimationFrame(renderLoop);
    }

    raf = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(raf);
  }, [ancho, alto, estadoRef, juegoIniciado]);

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
            onClick={() => setJuegoIniciado(true)}
          >
            🚀 Empezar Juego
          </button>
        )}
      </div>

      {/* Modal de Game Over / Victoria (siempre centrado en pantalla) */}
      {gameOver && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            zIndex: 9999,
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
              <button className="btn btn-success" onClick={() => reiniciar()}>
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

      {/* Tabla de puntuaciones */}
      {juegoIniciado && (
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
      )}

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
