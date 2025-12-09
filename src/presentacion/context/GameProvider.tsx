import { ReactNode, useRef } from "react";
import GameContext from "./GameContext";

import { AdaptadorAxios } from "../../infraestructura/http/AdaptadorAxios";
import { GeneradorIDUnico } from "../../infraestructura/util/GeneradorIDUnico";
import { RepositorioPuntuacionJsonServer } from "../../infraestructura/repositorios/RepositorioPuntuacionJsonServer";

export function GameProvider({ children }: { children: ReactNode }) {
  const http = useRef(new AdaptadorAxios("http://localhost:3000")).current;
  const repo = useRef(new RepositorioPuntuacionJsonServer(http)).current;
  const gen = useRef(new GeneradorIDUnico()).current;

  return (
    <GameContext.Provider value={{ repo, gen }}>
      {children}
    </GameContext.Provider>
  );
}
