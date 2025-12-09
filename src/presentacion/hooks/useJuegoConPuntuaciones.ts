import { useEffect, useRef, useState } from "react";
import { ConfiguracionNivel } from "../../dominio/entidades/ConfiguracionNivel";
import { IniciarNuevaPartida } from "../../aplicacion/casosUso/IniciarNuevaPartida";
import { MotorFisicoJuego } from "../../dominio/servicios/MotorFisicoJuego";
import {
  GestionarActualizacionJuego,
  EstadoJuego,
} from "../../aplicacion/casosUso/GestionarActualizacionJuego";
import { GuardarPuntuacionFinal } from "../../aplicacion/casosUso/GuardarPuntuacionFinal";
import { JuegoTerminadoError } from "../../dominio/errores/JuegoTerminadoError";
import { ObtenerMejoresPuntuaciones } from "../../aplicacion/casosUso/ObtenerMejoresPuntuaciones";
import { Puntuacion } from "../../dominio/entidades/Puntuacion";

import { RepositorioPuntuacion } from "../../dominio/puertos/RepositorioPuntuacion";
import { GeneradorID } from "../../dominio/puertos/GeneradorID";

type GameOver = { tipo: "derrota" | "victoria"; mensaje: string };

export function useJuegoConPuntuaciones(
  ancho: number,
  alto: number,
  limit: number,
  repo: RepositorioPuntuacion,
  gen: GeneradorID
) {
  // --- Estados públicos ---
  const [puntuacion, setPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState<null | GameOver>(null);

  // --- Refs internos ---
  const estadoRef = useRef<EstadoJuego | null>(null);
  const rafRef = useRef<number | null>(null);
  const guardadoRef = useRef(false);
  const ultimoRef = useRef<number>(performance.now());
  const inputRef = useRef({ moverX: 0, disparar: false });

  // --- Instancias estables ---
  const motor = useRef(new MotorFisicoJuego()).current;
  const configuracion = useRef(
    new ConfiguracionNivel(80, 1.2, 12, 0.02)
  ).current;

  // --- Estados de UI ---
  const [puntuaciones, setPuntuaciones] = useState<Puntuacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Guardar y terminar partida ---
  async function detenerYGuardar(
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

      const punt = estadoRef.current?.puntuacion ?? puntuacion;

      try {
        await GuardarPuntuacionFinal(repo, gen, "JugadorLocal", punt, {
          motivo: tipo,
          mensaje,
          tiempoSegundos: estadoRef.current?.tiempoTranscurrido ?? 0,
          enemigosRestantes: estadoRef.current?.enemigos.length ?? 0,
          ...detalles,
        });

        const nuevas = await ObtenerMejoresPuntuaciones(repo, limit);
        setPuntuaciones(nuevas);
      } catch (e) {
        console.error("Error guardando o refrescando puntuaciones", e);
      }
    }

    setGameOver({ tipo, mensaje });
  }

  // --- Loop ---
  function loop(now: number) {
    const delta = (now - ultimoRef.current) / 1000;
    ultimoRef.current = now;

    try {
      if (!estadoRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

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

      const sinEnemigos = nuevo.enemigos.length === 0;
      const todosFuera =
        nuevo.enemigos.length > 0 &&
        nuevo.enemigos.every((e) => e.posicion.y > alto);

      if (sinEnemigos || todosFuera) {
        detenerYGuardar("victoria", "¡Has derrotado a todos los enemigos!");
        return;
      }
    } catch (err) {
      if (err instanceof JuegoTerminadoError) {
        detenerYGuardar("derrota", err.message);
      } else {
        console.error("Error inesperado en loop:", err);
        detenerYGuardar("derrota", "Error inesperado en el juego");
      }
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
  }

  // --- Inicializar partida ---
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
    ultimoRef.current = performance.now();

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [ancho, alto, gen, configuracion]);

  // --- Iniciar loop ---
  function iniciar() {
    inputRef.current.moverX = 0;
    inputRef.current.disparar = false;
    ultimoRef.current = performance.now();
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(loop);
  }

  // --- Reiniciar ---
  function reiniciar() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

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

    ultimoRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }

  // --- Obtener mejores puntuaciones ---
  useEffect(() => {
    let mounted = true;

    ObtenerMejoresPuntuaciones(repo, limit)
      .then((data) => {
        if (!mounted) return;
        const ordenadas = [...data].sort(
          (a, b) => b.valorPuntuacion - a.valorPuntuacion
        );
        setPuntuaciones(ordenadas);
      })
      .catch((e) => mounted && setError(e.message))
      .finally(() => mounted && setCargando(false));

    return () => {
      mounted = false;
    };
  }, [repo, limit]);

  // --- Input ---
  useEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") inputRef.current.moverX = -1;
      if (e.key === "ArrowRight") inputRef.current.moverX = 1;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        inputRef.current.disparar = true;
      }
    }

    function keyUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && inputRef.current.moverX === -1)
        inputRef.current.moverX = 0;
      if (e.key === "ArrowRight" && inputRef.current.moverX === 1)
        inputRef.current.moverX = 0;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        inputRef.current.disparar = false;
      }
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  return {
    estadoRef,
    puntuacion,
    gameOver,
    iniciar,
    reiniciar,
    puntuaciones,
    cargando,
    error,
  };
}
