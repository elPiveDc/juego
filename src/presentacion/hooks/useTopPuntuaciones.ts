import { useEffect, useState } from "react";
import { AdaptadorAxios } from "../../infraestructura/http/AdaptadorAxios";
import { RepositorioPuntuacionJsonServer } from "../../infraestructura/repositorios/RepositorioPuntuacionJsonServer";
import { ObtenerMejoresPuntuaciones } from "../../aplicacion/casosUso/ObtenerMejoresPuntuaciones";
import { Puntuacion } from "../../dominio/entidades/Puntuacion";

export function useTopPuntuaciones(limit: number = 10) {
  const [puntuaciones, setPuntuaciones] = useState<Puntuacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const http = new AdaptadorAxios("http://localhost:3000");
    const repo = new RepositorioPuntuacionJsonServer(http);

    ObtenerMejoresPuntuaciones(repo, limit)
      .then((data) => setPuntuaciones(data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [limit]);

  return { puntuaciones, cargando, error };
}
