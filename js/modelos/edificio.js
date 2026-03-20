// ./js/modelos/edificio.js
import * as THREE from 'three';

export function crearEdificio() {
    const edificioGrupo = new THREE.Group();

    // Base (planta baja más ancha)
    const baseGeo = new THREE.BoxGeometry(4, 3, 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x444444 }); // gris oscuro concreto
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 1.5;
    edificioGrupo.add(base);

    // Torre principal (pisos altos)
    const torreGeo = new THREE.BoxGeometry(3, 20, 3);
    const torreMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const torre = new THREE.Mesh(torreGeo, torreMat);
    torre.position.y = 3 + 10; // encima de la base
    edificioGrupo.add(torre);

    // Techo moderno (plano con borde)
    const techoGeo = new THREE.BoxGeometry(3.5, 0.5, 3.5);
    const techoMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const techo = new THREE.Mesh(techoGeo, techoMat);
    techo.position.y = 3 + 20 + 0.25;
    edificioGrupo.add(techo);

    // Ventanas (emissive para que brillen de noche)
    const ventanaGeo = new THREE.PlaneGeometry(0.8, 1.2);
    const ventanaMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        emissive: 0x224466,
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide
    });

    // Agregar varias ventanas en la torre
    for (let piso = 1; piso <= 18; piso += 3) {
        for (let lado = 0; lado < 4; lado++) {
            const ang = (lado * Math.PI / 2) + Math.PI / 4;
            const ventana = new THREE.Mesh(ventanaGeo, ventanaMat);
            const radio = 1.6;
            ventana.position.set(
                Math.cos(ang) * radio,
                3 + piso,
                Math.sin(ang) * radio
            );
            ventana.rotation.y = ang + Math.PI / 2;
            edificioGrupo.add(ventana);
        }
    }

    // Antena o detalle en la cima (opcional)
    const antenaGeo = new THREE.CylinderGeometry(0.05, 0.05, 5, 6);
    const antenaMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    const antena = new THREE.Mesh(antenaGeo, antenaMat);
    antena.position.y = 3 + 20 + 2.5;
    edificioGrupo.add(antena);

    return edificioGrupo;
}