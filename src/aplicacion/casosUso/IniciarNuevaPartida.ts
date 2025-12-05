import { ConfiguracionNivel } from "../../dominio/entidades/ConfiguracionNivel";
import { NaveJugador } from "../../dominio/entidades/NaveJugador";
import { Vector2D } from "../../dominio/entidades/Vector2D";
import { Enemigo } from "../../dominio/entidades/Enemigo";
import type { GeneradorID } from "../../dominio/puertos/GeneradorID";

export function IniciarNuevaPartida(
  generadorID: GeneradorID,
  configuracion: ConfiguracionNivel,
  anchoPantalla: number
) {
  const nave = new NaveJugador(
    generadorID.generar(),
    3,
    new Vector2D(anchoPantalla / 2 - 20, 600),
    300
  );

  const enemigos: Enemigo[] = [];
  for (let i = 0; i < configuracion.cantidadEnemigosInicial; i++) {
    const tipo = i % 6 === 0 ? "tanque" : i % 3 === 0 ? "rapido" : "basico";
    const velocidad =
      tipo === "basico"
        ? configuracion.velocidadEnemigos
        : tipo === "rapido"
        ? configuracion.velocidadEnemigos * 1.4
        : configuracion.velocidadEnemigos * 0.6;
    const valor = tipo === "basico" ? 100 : tipo === "rapido" ? 150 : 300;
    enemigos.push(
      new Enemigo(
        generadorID.generar(),
        tipo,
        new Vector2D(50 + (i % 10) * 60, 50 + Math.floor(i / 10) * 40),
        velocidad,
        tipo === "tanque" ? 2 : 1,
        valor,
        undefined,
        tipo === "tanque" ? 3 : 1
      )
    );
  }

  return {
    nave,
    enemigos,
    proyectiles: [] as any[],
    tiempoTranscurrido: 0,
    puntuacion: 0,
  };
}
