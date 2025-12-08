import { Vector2D } from "./Vector2D";

export type TipoEnemigo = "basico" | "rapido" | "tanque";

export class Enemigo {
  constructor(
    public id: string,
    public tipo: TipoEnemigo,
    public posicion: Vector2D,
    public velocidad: number,
    public danio: number,
    public valorPuntuacion: number,
    public tamaño: { ancho: number; alto: number } = { ancho: 32, alto: 24 },
    public vida: number = 1,
    public spriteUrl: string = "/enemigo_basico.png"
  ) {}

  recibirDanio(d: number) {
    this.vida = Math.max(0, this.vida - d);
  }

  estaVivo(): boolean {
    return this.vida > 0;
  }
}
