// js/animaciones/saltar.js

export function gestionarSalto(jugador, datosSalto) {
    if (!datosSalto.enAire) return;

    // Aplicar velocidad al eje Y
    jugador.position.y += datosSalto.velocidadY;

    // Aplicar gravedad (va restando velocidad hacia arriba)
    datosSalto.velocidadY -= datosSalto.gravedad;

    // Si toca el suelo (o baja de la posición inicial)
    if (jugador.position.y <= 0) {
        jugador.position.y = 0;
        datosSalto.enAire = false;
        datosSalto.velocidadY = 0;
    }
}
