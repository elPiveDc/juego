import { RepositorioPuntuacion } from "../../dominio/puertos/RepositorioPuntuacion";
import { Puntuacion } from "../../dominio/entidades/Puntuacion";

export async function ObtenerMejoresPuntuaciones(
  repo: RepositorioPuntuacion,
  limit = 10
): Promise<Puntuacion[]> {
  const datos = await repo.obtenerTop(limit);
  return datos.sort((a, b) => b.valorPuntuacion - a.valorPuntuacion);
}
