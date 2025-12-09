import { createContext, useContext } from "react";
import { RepositorioPuntuacion } from "../../dominio/puertos/RepositorioPuntuacion";
import { GeneradorID } from "../../dominio/puertos/GeneradorID";

export interface GameDependencies {
  repo: RepositorioPuntuacion;
  gen: GeneradorID;
}

const GameContext = createContext<GameDependencies | null>(null);

export function useGameDependencies() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGameDependencies debe usarse dentro de <GameProvider>");
  }
  return ctx;
}

export default GameContext;
