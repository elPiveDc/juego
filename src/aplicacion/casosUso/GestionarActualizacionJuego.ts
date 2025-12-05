import { MotorFisicoJuego } from "../../dominio/servicios/MotorFisicoJuego";
import { Proyectil } from "../../dominio/entidades/Proyectil";
import { Enemigo } from "../../dominio/entidades/Enemigo";
import { NaveJugador } from "../../dominio/entidades/NaveJugador";
import { Vector2D } from "../../dominio/entidades/Vector2D";
import type { GeneradorID } from "../../dominio/puertos/GeneradorID";
import { JuegoTerminadoError } from "../../dominio/errores/JuegoTerminadoError";

export class EstadoJuego {
  constructor(
    public nave: NaveJugador,
    public enemigos: Enemigo[],
    public proyectiles: Proyectil[],
    public puntuacion: number,
    public tiempoTranscurrido: number
  ) {}
}

export function GestionarActualizacionJuego(
  estado: EstadoJuego,
  input: { moverX: number; disparar: boolean },
  deltaSegundos: number,
  motor: MotorFisicoJuego,
  generador: GeneradorID,
  configNivel: {
    velocidadEnemigos: number;
    frecuenciaDisparoEnemigo: number;
    anchoPantalla: number;
    altoPantalla: number;
  }
): EstadoJuego {
  estado.nave.posicion.x +=
    input.moverX * estado.nave.velocidad * deltaSegundos;

  estado.nave.posicion.x = Math.max(
    0,
    Math.min(
      configNivel.anchoPantalla - estado.nave.tamaño.ancho,
      estado.nave.posicion.x
    )
  );
  if (input.disparar) {
    const id = generador.generar();
    estado.proyectiles.push(
      new Proyectil(
        id,
        "jugador",
        new Vector2D(
          estado.nave.posicion.x + estado.nave.tamaño.ancho / 2,
          estado.nave.posicion.y
        ),
        new Vector2D(0, -600)
      )
    );
  }
  estado.proyectiles = estado.proyectiles.filter((p) => {
    p.posicion = motor.actualizarPosicionEntidad(
      p.posicion,
      p.velocidad,
      deltaSegundos
    );
    return !motor.detectarFueraDePantalla(
      p.posicion,
      configNivel.anchoPantalla,
      configNivel.altoPantalla
    );
  });
  for (const enemigo of estado.enemigos) {
    enemigo.posicion.y += enemigo.velocidad * deltaSegundos * 0.5;

    if (
      Math.random() <
      configNivel.frecuenciaDisparoEnemigo * deltaSegundos * 0.3
    ) {
      const id = generador.generar();
      estado.proyectiles.push(
        new Proyectil(
          id,
          "enemigo",
          new Vector2D(
            enemigo.posicion.x + enemigo.tamaño.ancho / 2,
            enemigo.posicion.y + enemigo.tamaño.alto
          ),
          new Vector2D(0, 200 + Math.random() * 100)
        )
      );
    }
  }

  const nuevosProyectiles: Proyectil[] = [];
  for (const p of estado.proyectiles) {
    if (p.origen === "jugador") {
      let impacto = false;
      for (const enemigo of estado.enemigos) {
        if (enemigo.estaVivo() && motor.colisionProyectilEnemigo(p, enemigo)) {
          enemigo.recibirDanio(p.danio);
          impacto = true;
          if (!enemigo.estaVivo()) {
            estado.puntuacion += enemigo.valorPuntuacion;
          }
          break;
        }
      }
      if (!impacto) nuevosProyectiles.push(p);
    } else {
      nuevosProyectiles.push(p);
    }
  }
  estado.proyectiles = nuevosProyectiles;

  for (const p of estado.proyectiles.slice()) {
    if (p.origen === "enemigo" && motor.colisionProyectilNave(p, estado.nave)) {
      estado.nave.recibirDanio(p.danio);

      estado.proyectiles = estado.proyectiles.filter((x) => x.id !== p.id);
    }
  }

  estado.enemigos = estado.enemigos.filter((e) => e.estaVivo());

  if (!estado.nave.estaViva()) {
    throw new JuegoTerminadoError("La nave fue destruida");
  }

  estado.tiempoTranscurrido += deltaSegundos;

  return estado;
}
