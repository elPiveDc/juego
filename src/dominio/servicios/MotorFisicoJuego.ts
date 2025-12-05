import { Vector2D } from "../entidades/Vector2D";
import { NaveJugador } from "../entidades/NaveJugador";
import { Enemigo } from "../entidades/Enemigo";
import { Proyectil } from "../entidades/Proyectil";

export class MotorFisicoJuego {
  actualizarPosicionEntidad(
    pos: Vector2D,
    velocidad: Vector2D,
    delta: number
  ): Vector2D {
    return pos.sumar(velocidad.multiplicarEscalar(delta));
  }

  colisionProyectilEnemigo(proyectil: Proyectil, enemigo: Enemigo): boolean {
    const centroEnemigo = new Vector2D(
      enemigo.posicion.x + enemigo.tamaño.ancho / 2,
      enemigo.posicion.y + enemigo.tamaño.alto / 2
    );
    const dist = proyectil.posicion.distanciaA(centroEnemigo);
    return (
      dist <=
      proyectil.radio + Math.max(enemigo.tamaño.ancho, enemigo.tamaño.alto) / 2
    );
  }

  colisionProyectilNave(proyectil: Proyectil, nave: NaveJugador): boolean {
    const centroNave = new Vector2D(
      nave.posicion.x + nave.tamaño.ancho / 2,
      nave.posicion.y + nave.tamaño.alto / 2
    );
    const dist = proyectil.posicion.distanciaA(centroNave);
    return (
      dist <=
      proyectil.radio + Math.max(nave.tamaño.ancho, nave.tamaño.alto) / 2
    );
  }

  detectarFueraDePantalla(
    pos: Vector2D,
    anchoPantalla: number,
    altoPantalla: number
  ): boolean {
    return (
      pos.x < -50 ||
      pos.x > anchoPantalla + 50 ||
      pos.y < -50 ||
      pos.y > altoPantalla + 50
    );
  }
}
