import React, { useEffect, useRef } from "react";
import { useJuego } from "../hooks/useJuego";

type Props = { ancho?: number; alto?: number };

export default function ComponenteJuego({ ancho = 800, alto = 700 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { estadoRef, puntuacion, gameOver, reiniciar } = useJuego(ancho, alto);

  useEffect(() => {
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
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, ancho, alto);

      // NAVE (con sprite si existe)
      if (estado.nave.spriteUrl) {
        const naveImg = new Image();
        naveImg.src = estado.nave.spriteUrl;
        // dibujar aunque la imagen no esté cargada (drawImage ignora hasta que cargue)
        ctx.drawImage(
          naveImg,
          estado.nave.posicion.x,
          estado.nave.posicion.y,
          estado.nave.tamaño.ancho,
          estado.nave.tamaño.alto
        );
      } else {
        ctx.fillStyle = "white";
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
          ctx.drawImage(
            img,
            e.posicion.x,
            e.posicion.y,
            e.tamaño.ancho,
            e.tamaño.alto
          );
        } else {
          ctx.fillStyle =
            e.tipo === "basico"
              ? "cyan"
              : e.tipo === "rapido"
              ? "orange"
              : "red";
          ctx.fillRect(
            e.posicion.x,
            e.posicion.y,
            e.tamaño.ancho,
            e.tamaño.alto
          );
        }
      }

      // PROYECTILES
      ctx.fillStyle = "white";
      for (const p of estado.proyectiles) {
        ctx.beginPath();
        ctx.arc(p.posicion.x, p.posicion.y, p.radio, 0, Math.PI * 2);
        ctx.fill();
      }

      // UI
      ctx.fillStyle = "white";
      ctx.font = "16px monospace";
      ctx.fillText(`Puntos: ${estado.puntuacion}`, 10, 20);
      ctx.fillText(`Vida: ${estado.nave.vida}`, 10, 40);

      raf = requestAnimationFrame(renderLoop);
    }

    raf = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(raf);
  }, [ancho, alto, estadoRef]);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={ancho}
        height={alto}
        style={{ border: "3px solid #222", background: "#ffffffff" }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={() => reiniciar()}>Reiniciar</button>
        <span style={{ marginLeft: 12 }}>Puntuación: {puntuacion}</span>
      </div>

      {/* Modal simple */}
      {gameOver && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: ancho,
            height: alto,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "#111",
              color: "white",
              padding: 20,
              borderRadius: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
              width: Math.min(400, ancho - 40),
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {gameOver.tipo === "derrota" ? "Game Over" : "¡Victoria!"}
            </h2>
            <p>{gameOver.mensaje}</p>
            <p>Puntuación final: {puntuacion}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => reiniciar()}>Reiniciar</button>
              <button onClick={() => window.location.reload()}>Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
