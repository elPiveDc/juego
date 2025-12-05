import { RepositorioPuntuacion } from "../../dominio/puertos/RepositorioPuntuacion";
import { Puntuacion } from "../../dominio/entidades/Puntuacion";
import { GeneradorID } from "../../dominio/puertos/GeneradorID";

export async function GuardarPuntuacionFinal(
  repo: RepositorioPuntuacion,
  gen: GeneradorID,
  nombreUsuario: string,
  valor: number,
  detalles: any
): Promise<Puntuacion> {
  const p = new Puntuacion(
    gen.generar(),
    nombreUsuario,
    valor,
    new Date().toISOString(),
    detalles
  );
  return repo.guardar(p);
}
