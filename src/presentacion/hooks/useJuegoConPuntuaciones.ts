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
import { ObtenerMejoresPuntuaciones } from "../../aplicacion/casosUso/ObtenerMejoresPuntuaciones";
import { Puntuacion } from "../../dominio/entidades/Puntuacion";

type GameOver = { tipo: "derrota" | "victoria"; mensaje: string };

export function useJuegoConPuntuaciones(
  ancho: number,
  alto: number,
  limit: number = 10
) {
  // --- Estados del juego ---
  const [puntuacion, setPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState<null | GameOver>(null);

  const estadoRef = useRef<EstadoJuego | null>(null);
  const rafRef = useRef<number | null>(null);
  const guardadoRef = useRef(false);
  const ultimoRef = useRef<number>(performance.now());

  const motor = useRef(new MotorFisicoJuego()).current;
  const gen = useRef(new GeneradorIDUnico()).current;
  const http = useRef(new AdaptadorAxios("http://localhost:3000")).current;
  const repo = useRef(new RepositorioPuntuacionJsonServer(http)).current;

  const configuracion = useRef(
    new ConfiguracionNivel(80, 1.2, 12, 0.02)
  ).current;
  const inputRef = useRef({ moverX: 0, disparar: false });

  // --- Estados de puntuaciones ---
  const [puntuaciones, setPuntuaciones] = useState<Puntuacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Disponible en todo el hook
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

  // Única función de loop reutilizable
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

      // Fin de partida por victoria
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
        return;
      } else {
        console.error("Error inesperado en loop:", err);
        detenerYGuardar("derrota", "Error inesperado en el juego");
        return;
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }

  // Iniciar partida al montar o cuando cambie el ancho
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

    // Lanzar loop
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [ancho, alto, configuracion, gen, motor, repo]);

  // Input keyboard
  useEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") inputRef.current.moverX = -1;
      if (e.key === "ArrowRight") inputRef.current.moverX = 1;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault(); // 🔑 evita que la página se desplace
        inputRef.current.disparar = true;
      }
    }

    function keyUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && inputRef.current.moverX === -1)
        inputRef.current.moverX = 0;
      if (e.key === "ArrowRight" && inputRef.current.moverX === 1)
        inputRef.current.moverX = 0;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault(); // también aquí por seguridad
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

  // Reiniciar partida desde UI
  function reiniciar() {
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

    // Resetear el tiempo del delta y relanzar
    ultimoRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }

  // Obtener mejores puntuaciones
  useEffect(() => {
    ObtenerMejoresPuntuaciones(repo, limit)
      .then((data) => setPuntuaciones(data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [repo, limit]);

  return {
    estadoRef,
    puntuacion,
    gameOver,
    reiniciar,
    puntuaciones,
    cargando,
    error,
  };
}
