import { Vector2D } from "./Vector2D";

export class NaveJugador {
  constructor(
    public id: string,
    public vida: number,
    public spriteUrl: string = "/mi_negocio.png",
    public posicion: Vector2D,
    public velocidad: number,
    public tamaño: { ancho: number; alto: number } = { ancho: 40, alto: 28 }
  ) {}

  recibirDanio(d: number) {
    this.vida = Math.max(0, this.vida - d);
  }

  estaViva(): boolean {
    return this.vida > 0;
  }
}
