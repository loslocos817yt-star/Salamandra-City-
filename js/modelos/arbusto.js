// --- js/modelos/arbusto.js ---
import * as THREE from 'three';

export function crearArbusto() {
    const grupo = new THREE.Group();

    // Material verde hojas
    const matHojas = new THREE.MeshStandardMaterial({ 
        color: 0x00B308, 
        flatShading: true 
    });

    // Creamos un arbusto usando 3 esferas en diferentes posiciones
    const geoEsfera = new THREE.SphereGeometry(0.5, 8, 8);
    
    const bola1 = new THREE.Mesh(geoEsfera, matHojas);
    bola1.position.set(0, 0.3, 0);
    
    const bola2 = new THREE.Mesh(geoEsfera, matHojas);
    bola2.position.set(0.3, 0.2, 0.2);
    bola2.scale.set(0.8, 0.8, 0.8);

    const bola3 = new THREE.Mesh(geoEsfera, matHojas);
    bola3.position.set(-0.3, 0.2, -0.1);
    bola3.scale.set(0.9, 0.9, 0.9);

    grupo.add(bola1, bola2, bola3);
    
    // Metadata para colisión suave (la salamandra puede pasar cerca)
    grupo.userData.radio = 0.4;
    
    return grupo;
}
