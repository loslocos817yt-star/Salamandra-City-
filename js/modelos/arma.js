import * as THREE from 'three';

export function crearArma() {
    const grupoArma = new THREE.Group();

    // Material de metal oscuro
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 });
    // Detalles (gatillo, cañón)
    const detalleMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 });

    // Cuerpo principal del arma
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, 0.05), metalMat);
    grupoArma.add(cuerpo);

    // Cañón
    const canon = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 8), detalleMat);
    canon.rotation.x = Math.PI / 2;
    canon.position.set(0, 0.005, 0.03);
    grupoArma.add(canon);

    // Empuñadura (donde la agarra)
    const mango = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.015), metalMat);
    mango.position.set(0, -0.02, 0);
    mango.rotation.x = -0.2; // Un poco inclinada
    grupoArma.add(mango);

    // Cargador
    const cargador = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.035, 0.012), detalleMat);
    cargador.position.set(0, -0.025, 0); 
    grupoArma.add(cargador);

    // Mira trasera
    const mira = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.005), detalleMat);
    mira.position.set(0, 0.015, -0.015);
    grupoArma.add(mira);

    return grupoArma;
}
