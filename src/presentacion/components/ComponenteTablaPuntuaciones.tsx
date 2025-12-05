import React, { useEffect, useState } from "react";
import { AdaptadorAxios } from "../../infraestructura/http/AdaptadorAxios";
import { RepositorioPuntuacionJsonServer } from "../../infraestructura/repositorios/RepositorioPuntuacionJsonServer";
import { ObtenerMejoresPuntuaciones } from "../../aplicacion/casosUso/ObtenerMejoresPuntuaciones";
import { Puntuacion } from "../../dominio/entidades/Puntuacion";

export default function ComponenteTablaPuntuaciones() {
  const [top, setTop] = useState<Puntuacion[]>([]);
  const http = new AdaptadorAxios("http://localhost:3000");
  const repo = new RepositorioPuntuacionJsonServer(http);

  useEffect(() => {
    ObtenerMejoresPuntuaciones(repo, 10).then(setTop).catch(console.error);
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Top 10</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Jugador</th>
            <th>Puntos</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {top.map((p, i) => (
            <tr key={p.id}>
              <td>{i + 1}</td>
              <td>{p.nombreUsuario}</td>
              <td>{p.valorPuntuacion}</td>
              <td>{new Date(p.fechaRegistro).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
