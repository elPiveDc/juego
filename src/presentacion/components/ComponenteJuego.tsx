import React, { useEffect, useRef, useState } from "react";
import { AdaptadorAxios } from "../../infraestructura/http/AdaptadorAxios";
import { RepositorioPuntuacionJsonServer } from "../../infraestructura/repositorios/RepositorioPuntuacionJsonServer";
import { GeneradorIDUnico } from "../../infraestructura/util/GeneradorIDUnico";
import { ConfiguracionNivel } from "../../dominio/entidades/ConfiguracionNivel";
import { IniciarNuevaPartida } from "../../aplicacion/casosUso/IniciarNuevaPartida";
import { MotorFisicoJuego } from "../../dominio/servicios/MotorFisicoJuego";
import {
  GestionarActualizacionJuego,
  EstadoJuego,
} from "../../aplicacion/casosUso/GestionarActualizacionJuego";
import { GuardarPuntuacionFinal } from "../../aplicacion/casosUso/GuardarPuntuacionFinal";

type Props = { ancho?: number; alto?: number };

export default function ComponenteJuego({ ancho = 800, alto = 700 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [corriendo, setCorriendo] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const motor = useRef(new MotorFisicoJuego()).current;
  const gen = useRef(new GeneradorIDUnico()).current;

  const http = useRef(new AdaptadorAxios("http://localhost:3000")).current;
  const repo = useRef(new RepositorioPuntuacionJsonServer(http)).current;

  const configuracion = new ConfiguracionNivel(80, 1.2, 12, 0.02);
  const estadoRef = useRef<EstadoJuego | null>(null);

  const inputRef = useRef({ moverX: 0, disparar: false });

  useEffect(() => {
    const s = IniciarNuevaPartida(gen, configuracion, ancho);
    estadoRef.current = new EstadoJuego(
      s.nave,
      s.enemigos,
      s.proyectiles,
      s.puntuacion,
      s.tiempoTranscurrido
    );
    setPuntuacion(0);
    setCorriendo(true);
  }, []);

  useEffect(() => {
    let raf = 0;
    let ultimo = performance.now();

    function loop(now: number) {
      const delta = (now - ultimo) / 1000;
      ultimo = now;

      try {
        if (estadoRef.current) {
          const nuevo = GestionarActualizacionJuego(
            estadoRef.current,
            inputRef.current,
            delta,
            motor,
            gen,
            {
              velocidadEnemigos: configuracion.velocidadEnemigos,
              frecuenciaDisparoEnemigo: configuracion.frecuenciaDisparoEnemigo,
              anchoPantalla: ancho,
              altoPantalla: alto,
            }
          );
          estadoRef.current = nuevo;
          setPuntuacion(nuevo.puntuacion);

          render(nuevo);
        }
      } catch (err) {
        setCorriendo(false);
        if (err instanceof Error) {
          const detalles = {
            duracionSegundos: estadoRef.current?.tiempoTranscurrido ?? 0,
            enemigosEliminados: 0,
            disparosRealizados: 0,
            naveJugadorFinal: {
              vida: estadoRef.current?.nave.vida ?? 0,
              posicionFinal: {
                x: estadoRef.current?.nave.posicion.x ?? 0,
                y: estadoRef.current?.nave.posicion.y ?? 0,
              },
            },
            configuracionNivelUsada: {
              velocidadEnemigos: configuracion.velocidadEnemigos,
              frecuenciaDisparoEnemigo: configuracion.frecuenciaDisparoEnemigo,
              cantidadEnemigosInicial: configuracion.cantidadEnemigosInicial,
            },
          };
          GuardarPuntuacionFinal(
            repo,
            gen,
            "JugadorLocal",
            puntuacion,
            detalles
          ).catch((e) => console.error("Error guardando puntuación", e));
        }
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [motor, gen, ancho, alto, configuracion]);

  useEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") inputRef.current.moverX = -1;
      if (e.key === "ArrowRight") inputRef.current.moverX = 1;
      if (e.key === " " || e.key === "Spacebar")
        inputRef.current.disparar = true;
    }
    function keyUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && inputRef.current.moverX === -1)
        inputRef.current.moverX = 0;
      if (e.key === "ArrowRight" && inputRef.current.moverX === 1)
        inputRef.current.moverX = 0;
      if (e.key === " " || e.key === "Spacebar")
        inputRef.current.disparar = false;
    }
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  function render(estado: EstadoJuego) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ancho, alto);

    const nave = estado.nave;
    ctx.fillStyle = "white";
    ctx.fillRect(
      nave.posicion.x,
      nave.posicion.y,
      nave.tamaño.ancho,
      nave.tamaño.alto
    );
    for (const e of estado.enemigos) {
      ctx.fillStyle =
        e.tipo === "basico" ? "cyan" : e.tipo === "rapido" ? "orange" : "red";
      ctx.fillRect(e.posicion.x, e.posicion.y, e.tamaño.ancho, e.tamaño.alto);
    }

    for (const p of estado.proyectiles) {
      ctx.beginPath();
      ctx.arc(p.posicion.x, p.posicion.y, p.radio, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.fillText(`Puntos: ${estado.puntuacion}`, 10, 20);
    ctx.fillText(`Vida: ${estado.nave.vida}`, 10, 40);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={ancho}
        height={alto}
        style={{ border: "3px solid #222", background: "#000" }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={() => location.reload()}>Reiniciar</button>
        <span style={{ marginLeft: 12 }}>Puntuación: {puntuacion}</span>
      </div>
    </div>
  );
}
