import { Puntuacion } from "../entidades/Puntuacion";

export interface RepositorioPuntuacion {
  obtenerTodas(): Promise<Puntuacion[]>;
  guardar(p: Puntuacion): Promise<Puntuacion>;
  obtenerTop(limit: number): Promise<Puntuacion[]>;
}
