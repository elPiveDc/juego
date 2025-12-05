import { RepositorioPuntuacion } from "../../dominio/puertos/RepositorioPuntuacion";
import { Puntuacion } from "../../dominio/entidades/Puntuacion";

export async function ObtenerMejoresPuntuaciones(
  repo: RepositorioPuntuacion,
  limit = 10
): Promise<Puntuacion[]> {
  return repo.obtenerTop(limit);
}
