// --- js/modelos/arbol.js ---
import * as THREE from 'three';

export function crearArbol() {
    const grupo = new THREE.Group();

    // 1. Tronco (Cilindro café)
    const matTronco = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
    const geoTronco = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
    const tronco = new THREE.Mesh(geoTronco, matTronco);
    tronco.position.y = 0.75;
    grupo.add(tronco);

    // 2. Copa (Cono verde para estilo pino o esfera para árbol normal)
    const matHojas = new THREE.MeshStandardMaterial({ 
        color: 0x008E06, 
        flatShading: true 
    });
    
    // Haremos una copa de 3 niveles de conos para que se vea pro
    for(let i = 0; i < 3; i++) {
        const geoCopa = new THREE.ConeGeometry(0.8 - (i * 0.2), 1.2, 8);
        const copa = new THREE.Mesh(geoCopa, matHojas);
        copa.position.y = 1.5 + (i * 0.6);
        grupo.add(copa);
    }

    // Colisión: el tronco es lo que detiene al jugador
    grupo.userData.radio = 0.3;

    return grupo;
}
