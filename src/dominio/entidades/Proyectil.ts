import { Vector2D } from "./Vector2D";

export type OrigenProyectil = "jugador" | "enemigo";

export class Proyectil {
  constructor(
    public id: string,
    public origen: OrigenProyectil,
    public posicion: Vector2D,
    public velocidad: Vector2D,
    public danio: number = 1,
    public radio: number = 4
  ) {}
}
