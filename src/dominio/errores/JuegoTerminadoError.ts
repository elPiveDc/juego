export class JuegoTerminadoError extends Error {
  constructor(message = "La partida ha terminado") {
    super(message);
    this.name = "JuegoTerminadoError";
  }
}
