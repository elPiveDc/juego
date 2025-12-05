import './App.css'
import ComponenteJuego from './presentacion/components/ComponenteJuego'
import ComponenteTablaPuntuaciones from './presentacion/components/ComponenteTablaPuntuaciones'

function App() {

  return (
    <>
      <h1>Galaga Clean Architecture</h1>
      <ComponenteJuego />
      <ComponenteTablaPuntuaciones />
    </>
  )
}

export default App
