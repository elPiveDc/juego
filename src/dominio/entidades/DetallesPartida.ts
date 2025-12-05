import { Vector2D } from "./Vector2D";

export class EstadoNaveFinal {
  constructor(public vida: number, public posicionFinal: Vector2D) {}
}

export class ConfiguracionNivelUsada {
  constructor(
    public velocidadEnemigos: number,
    public frecuenciaDisparoEnemigo: number,
    public cantidadEnemigosInicial: number
  ) {}
}

export class DetallesPartida {
  constructor(
    public duracionSegundos: number,
    public enemigosEliminados: number,
    public disparosRealizados: number,
    public naveJugadorFinal: EstadoNaveFinal,
    public configuracionNivelUsada: ConfiguracionNivelUsada
  ) {}
}
