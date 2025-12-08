import { useTopPuntuaciones } from "../hooks/useTopPuntuaciones";

export default function TablaPuntuaciones() {
  const { puntuaciones, cargando, error } = useTopPuntuaciones(10);

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

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
          {puntuaciones.map((p, i) => (
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
