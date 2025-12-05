export class ConfiguracionNivel {
  constructor(
    public velocidadEnemigos: number,
    public frecuenciaDisparoEnemigo: number, // segundos entre disparos
    public cantidadEnemigosInicial: number,
    public aceleracionConTiempo: number = 0.05
  ) {}
}
