import { useEffect } from "react";

type EstadoRef = { current: any | null };

export function useCanvasRenderer(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    estadoRef: EstadoRef,
    ancho: number,
    alto: number,
    activo: boolean
) {
    useEffect(() => {
        if (!activo) return;

        let raf = 0;

        function renderLoop() {
            const estado = estadoRef.current;
            const canvas = canvasRef.current;
            if (!estado || !canvas) {
                raf = requestAnimationFrame(renderLoop);
                return;
            }

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                raf = requestAnimationFrame(renderLoop);
                return;
            }

            // Fondo
            ctx.clearRect(0, 0, ancho, alto);
            ctx.fillStyle = "#cedeffff";
            ctx.fillRect(0, 0, ancho, alto);

            // Estrellas sutiles
            ctx.fillStyle = "rgba(255,255,255,0.03)";
            for (let i = 0; i < 30; i++) {
                const x = (i * 97) % ancho;
                const y = (i * 53) % alto;
                ctx.fillRect(x, y, 1, 1);
            }

            try {
                // NAVE
                if (estado.nave?.spriteUrl) {
                    const naveImg = new Image();
                    naveImg.src = estado.nave.spriteUrl;
                    if (naveImg.complete) {
                        ctx.drawImage(
                            naveImg,
                            estado.nave.posicion.x,
                            estado.nave.posicion.y,
                            estado.nave.tamaño.ancho,
                            estado.nave.tamaño.alto
                        );
                    } else {
                        naveImg.onload = () =>
                            ctx.drawImage(
                                naveImg,
                                estado.nave.posicion.x,
                                estado.nave.posicion.y,
                                estado.nave.tamaño.ancho,
                                estado.nave.tamaño.alto
                            );
                    }
                } else if (estado.nave) {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(
                        estado.nave.posicion.x,
                        estado.nave.posicion.y,
                        estado.nave.tamaño.ancho,
                        estado.nave.tamaño.alto
                    );
                }

                // ENEMIGOS
                for (const e of estado.enemigos ?? []) {
                    if (e.spriteUrl) {
                        const img = new Image();
                        img.src = e.spriteUrl;
                        if (img.complete) {
                            ctx.drawImage(img, e.posicion.x, e.posicion.y, e.tamaño.ancho, e.tamaño.alto);
                        } else {
                            img.onload = () =>
                                ctx.drawImage(img, e.posicion.x, e.posicion.y, e.tamaño.ancho, e.tamaño.alto);
                        }
                    } else {
                        ctx.fillStyle =
                            e.tipo === "basico" ? "#00f5ff" : e.tipo === "rapido" ? "#ff9f1c" : "#ff4d6d";
                        ctx.fillRect(e.posicion.x, e.posicion.y, e.tamaño.ancho, e.tamaño.alto);
                    }
                }

                // PROYECTILES
                for (const p of estado.proyectiles ?? []) {
                    ctx.beginPath();
                    ctx.fillStyle = "#97152bff";
                    ctx.arc(p.posicion.x, p.posicion.y, p.radio, 0, Math.PI * 2);
                    ctx.fill();
                }

                // UI
                ctx.fillStyle = "#070424ff";
                ctx.font = "16px monospace";
                ctx.fillText(`Puntos: ${estado.puntuacion ?? 0}`, 12, 22);
                ctx.fillText(`Vida: ${estado.nave?.vida ?? 0}`, 12, 44);
            } catch (err) {
                console.error("Render error:", err);
            }

            raf = requestAnimationFrame(renderLoop);
        }

        raf = requestAnimationFrame(renderLoop);
        return () => cancelAnimationFrame(raf);
    }, [canvasRef, estadoRef, ancho, alto, activo]);
}
