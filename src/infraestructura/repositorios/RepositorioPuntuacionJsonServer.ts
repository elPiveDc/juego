import { RepositorioPuntuacion } from "../../dominio/puertos/RepositorioPuntuacion";
import { Puntuacion } from "../../dominio/entidades/Puntuacion";
import { AdaptadorAxios } from "../http/AdaptadorAxios";

export class RepositorioPuntuacionJsonServer implements RepositorioPuntuacion {
  constructor(private http: AdaptadorAxios) {}

  async obtenerTodas(): Promise<Puntuacion[]> {
    return this.http.get<Puntuacion[]>("/puntuaciones");
  }

  async guardar(p: Puntuacion): Promise<Puntuacion> {
    return this.http.post<Puntuacion>("/puntuaciones", p);
  }

  async obtenerTop(limit = 10): Promise<Puntuacion[]> {
    return this.http.get<Puntuacion[]>("/puntuaciones", {
      _sort: "valorPuntuacion",
      _order: "desc",
      _limit: limit,
    });
  }
}
