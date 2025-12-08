import { useEffect, useRef, useState } from "react";
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
import { JuegoTerminadoError } from "../../dominio/errores/JuegoTerminadoError";

export function useJuego(ancho: number, alto: number) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState<null | {
    tipo: "derrota" | "victoria";
    mensaje: string;
  }>(null);

  const estadoRef = useRef<EstadoJuego | null>(null);
  const rafRef = useRef<number | null>(null);
  const guardadoRef = useRef(false); // evita múltiples saves

  const motor = useRef(new MotorFisicoJuego()).current;
  const gen = useRef(new GeneradorIDUnico()).current;
  const http = useRef(new AdaptadorAxios("http://localhost:3000")).current;
  const repo = useRef(new RepositorioPuntuacionJsonServer(http)).current;

  const configuracion = useRef(
    new ConfiguracionNivel(80, 1.2, 12, 0.02)
  ).current;

  const inputRef = useRef({ moverX: 0, disparar: false });

  // Iniciar Partida
  useEffect(() => {
    const partida = IniciarNuevaPartida(gen, configuracion, ancho);
    estadoRef.current = new EstadoJuego(
      partida.nave,
      partida.enemigos,
      partida.proyectiles,
      partida.puntuacion,
      partida.tiempoTranscurrido
    );
    setPuntuacion(0);
    setGameOver(null);
    guardadoRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  // Loop principal (controlado)
  useEffect(() => {
    let ultimo = performance.now();

    function detenerYGuardar(
      tipo: "derrota" | "victoria",
      mensaje: string,
      detalles: any = {}
    ) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (!guardadoRef.current) {
        guardadoRef.current = true;
        // Guardar puntuación final (una sola vez)
        const punt = estadoRef.current?.puntuacion ?? puntuacion;
        GuardarPuntuacionFinal(repo, gen, "JugadorLocal", punt, {
          motivo: tipo,
          mensaje,
          tiempoSegundos: estadoRef.current?.tiempoTranscurrido ?? 0,
          enemigosRestantes: estadoRef.current?.enemigos.length ?? 0,
          ...detalles,
        }).catch((e) => console.error("Error guardando puntuación", e));
      }
      setGameOver({ tipo, mensaje });
    }

    function loop(now: number) {
      const delta = (now - ultimo) / 1000;
      ultimo = now;

      try {
        if (!estadoRef.current) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        // Actualiza estado
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

        // Detectar VICTORIA por "enemigos salieron de la pantalla" (todos por debajo)
        const todosFuera =
          nuevo.enemigos.length > 0 &&
          nuevo.enemigos.every((e) => e.posicion.y > alto);
        if (todosFuera) {
          detenerYGuardar(
            "victoria",
            "Todos los enemigos salieron de la pantalla. Oleada terminada."
          );
          return; // no schedule next frame
        }
      } catch (err) {
        // Si ocurre JuegoTerminadoError => derrota
        if (err instanceof JuegoTerminadoError) {
          detenerYGuardar("derrota", err.message);
          return; // stop loop
        } else {
          // otros errores: loguear y detener para evitar behavior inesperado
          console.error("Error inesperado en loop:", err);
          detenerYGuardar("derrota", "Error inesperado en el juego");
          return;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ancho, alto]);

  // Input keyboard
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

  // función para reiniciar manualmente desde UI
  function reiniciar() {
    // cancelar cualquier RAF vigente
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    guardadoRef.current = false;
    setPuntuacion(0);
    setGameOver(null);
    const partida = IniciarNuevaPartida(gen, configuracion, ancho);
    estadoRef.current = new EstadoJuego(
      partida.nave,
      partida.enemigos,
      partida.proyectiles,
      partida.puntuacion,
      partida.tiempoTranscurrido
    );
    // re-lanzar loop: simple way -> forzar efecto: crear un RAF inmediatamente
    rafRef.current = requestAnimationFrame((t) => {
      /* el effect principal agarra esto */
    });
  }

  return {
    estadoRef,
    puntuacion,
    gameOver,
    reiniciar,
  };
}
