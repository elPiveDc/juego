export class ConfiguracionNivel {
  constructor(
    public velocidadEnemigos: number,
    public frecuenciaDisparoEnemigo: number,
    public cantidadEnemigosInicial: number,
    public aceleracionConTiempo: number = 0.05
  ) {}
}
