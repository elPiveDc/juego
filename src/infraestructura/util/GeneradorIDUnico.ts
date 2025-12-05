import { GeneradorID } from "../../dominio/puertos/GeneradorID";

export class GeneradorIDUnico implements GeneradorID {
  generar(): string {
    return (
      "id_" +
      Math.random().toString(36).substring(2, 10) +
      Date.now().toString(36)
    );
  }
}
