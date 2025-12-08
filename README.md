# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## jsonserver:

{
"puntuaciones": [
{
"id": "p1",
"nombreUsuario": "Piloto_X",
"valorPuntuacion": 12500,
"fechaRegistro": "2025-12-05T17:15:00Z",
"detallesPartida": {
"duracionSegundos": 185,
"enemigosEliminados": 57,
"disparosRealizados": 221,
"naveJugadorFinal": {
"vida": 0,
"posicionFinal": { "x": 128, "y": 620 }
},
"configuracionNivelUsada": {
"velocidadEnemigos": 2.5,
"frecuenciaDisparoEnemigo": 1.2,
"cantidadEnemigosInicial": 10
}
}
},
{
"id": "p2",
"nombreUsuario": "ComandanteA",
"valorPuntuacion": 8400,
"fechaRegistro": "2025-11-20T12:10:00Z",
"detallesPartida": {
"duracionSegundos": 140,
"enemigosEliminados": 38,
"disparosRealizados": 145,
"naveJugadorFinal": {
"vida": 1,
"posicionFinal": { "x": 300, "y": 620 }
},
"configuracionNivelUsada": {
"velocidadEnemigos": 2.0,
"frecuenciaDisparoEnemigo": 1.0,
"cantidadEnemigosInicial": 12
}
}
}
],
"historialPartidas": [
{
"id": "h1",
"fecha": "2025-12-01T15:00:00Z",
"enemigos": [
{ "id": "e1", "tipo": "basico", "posicion": { "x": 50, "y": 40 }, "velocidad": 1.6, "valorPuntuacion": 100 },
{ "id": "e2", "tipo": "rapido", "posicion": { "x": 110, "y": 40 }, "velocidad": 2.4, "valorPuntuacion": 150 }
],
"proyectilesDisparados": [
{ "id": "pr1", "origen": "jugador", "danio": 1, "posicionInicial": { "x": 128, "y": 620 } },
{ "id": "pr2", "origen": "enemigo", "danio": 1, "posicionInicial": { "x": 110, "y": 60 } }
],
"naveJugador": {
"id": "n1",
"vidaInicial": 3,
"posicionInicial": { "x": 128, "y": 620 },
"velocidad": 300
},
"configuracionNivel": {
"velocidadEnemigos": 1.8,
"frecuenciaDisparoEnemigo": 1.1,
"cantidadEnemigosInicial": 10
},
"resultado": {
"duracionSegundos": 160,
"enemigosEliminados": 45,
"puntosObtenidos": 9800
}
}
]
}
