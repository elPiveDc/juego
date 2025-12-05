import { DetallesPartida } from "./DetallesPartida";

export class Puntuacion {
  constructor(
    public id: string,
    public nombreUsuario: string,
    public valorPuntuacion: number,
    public fechaRegistro: string, // ISO
    public detallesPartida: DetallesPartida
  ) {}
}
