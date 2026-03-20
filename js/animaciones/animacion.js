export function actualizarAnimacion(salamandra, moviendose) {
    const data = salamandra.userData;
    data.fase += 0.15; // Velocidad del paso

    if (moviendose) {
        // Balanceo lateral (tipo pingüino/salamandra bípede)
        salamandra.rotation.z = Math.sin(data.fase) * 0.2;
        // Rebote arriba y abajo
        salamandra.position.y = Math.abs(Math.sin(data.fase)) * 0.01;
        // Efecto látigo en la cola
        data.colaSegmentos.forEach((seg, i) => {
            seg.position.x = Math.sin(data.fase - i * 0.6) * 0.02;
        });
    } else {
        // Suavizar posición al detenerse
        salamandra.rotation.z *= 0.9;
        salamandra.position.y *= 0.9;
        // Respiración sutil
        salamandra.scale.y = 1 + Math.sin(data.fase * 0.3) * 0.01;
    }
}

