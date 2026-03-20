import * as THREE from 'three';

export function crearCasa() {
    const casaGrupo = new THREE.Group();

    // 1. Paredes (Cubo principal)
    const paredesGeo = new THREE.BoxGeometry(1, 1, 1);
    const paredesMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee }); // Blanco roto
    const paredes = new THREE.Mesh(paredesGeo, paredesMat);
    paredes.position.y = 0.5; // Apoyada en el suelo
    casaGrupo.add(paredes);

    // 2. Techo (Pirámide de 4 caras)
    const techoGeo = new THREE.ConeGeometry(0.8, 0.5, 4);
    const techoMat = new THREE.MeshStandardMaterial({ color: 0x882222 }); // Rojo teja
    const techo = new THREE.Mesh(techoGeo, techoMat);
    techo.position.y = 1.25;
    techo.rotation.y = Math.PI / 4; // Rotar para que encaje con las esquinas del cubo
    casaGrupo.add(techo);

    // 3. Puerta
    const puertaGeo = new THREE.PlaneGeometry(0.2, 0.4);
    const puertaMat = new THREE.MeshStandardMaterial({ color: 0x442200 }); // Madera
    const puerta = new THREE.Mesh(puertaGeo, puertaMat);
    puerta.position.set(0, 0.2, 0.51); // Un pelín adelante de la pared
    casaGrupo.add(puerta);

    // 4. Ventanas
    const ventanaGeo = new THREE.PlaneGeometry(0.2, 0.2);
    const ventanaMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x224466 });
    
    const ventanaL = new THREE.Mesh(ventanaGeo, ventanaMat);
    ventanaL.position.set(-0.25, 0.6, 0.51);
    casaGrupo.add(ventanaL);

    const ventanaR = ventanaL.clone();
    ventanaR.position.set(0.25, 0.6, 0.51);
    casaGrupo.add(ventanaR);

    return casaGrupo;
}
