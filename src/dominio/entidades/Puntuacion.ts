import { DetallesPartida } from "./DetallesPartida";

export class Puntuacion {
  constructor(
    public id: string,
    public nombreUsuario: string,
    public valorPuntuacion: number,
    public fechaRegistro: string,
    public detallesPartida: DetallesPartida
  ) {}
}
