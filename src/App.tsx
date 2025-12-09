import "./App.css";
import JuegoConPuntuaciones from "./presentacion/components/ComponenteJuegoConPuntuaciones";
import { GameProvider } from "./presentacion/context/GameProvider";

function App() {
  return (
    <GameProvider>
      <JuegoConPuntuaciones />
    </GameProvider>
  );
}

export default App;
