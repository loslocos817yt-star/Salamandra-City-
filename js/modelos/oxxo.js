import * as THREE from 'three';

export function crearOxxo() {
    const oxxoGrupo = new THREE.Group();

    // --- 1. ESTRUCTURA PRINCIPAL (El cajón blanco) ---
    const cuerpoGeo = new THREE.BoxGeometry(6, 3.5, 4);
    const cuerpoMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Blanco Oxxo
    const cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat);
    cuerpo.position.y = 1.75;
    oxxoGrupo.add(cuerpo);

    // --- 2. MARCO ROJO SUPERIOR (Identidad visual) ---
    const marcoGeo = new THREE.BoxGeometry(6.2, 0.8, 4.2);
    const marcoMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 }); // Rojo
    const marco = new THREE.Mesh(marcoGeo, marcoMat);
    marco.position.y = 3.3; // En la parte de arriba
    oxxoGrupo.add(marco);

    // --- 3. FRANJA AMARILLA (El toque clásico) ---
    const franjaGeo = new THREE.BoxGeometry(6.21, 0.15, 4.21);
    const franjaMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 }); // Amarillo
    const franja = new THREE.Mesh(franjaGeo, franjaMat);
    franja.position.y = 3.1; // Justo debajo del borde rojo
    oxxoGrupo.add(franja);

    // --- 4. ENTRADA (Puertas de cristal) ---
    const puertaGeo = new THREE.PlaneGeometry(1.5, 2.2);
    const puertaMat = new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        transparent: true, 
        opacity: 0.6 
    });
    const puerta = new THREE.Mesh(puertaGeo, puertaMat);
    puerta.position.set(0, 1.1, 2.01); // Centrada al frente
    oxxoGrupo.add(puerta);

    // --- 5. VENTANALES LATERALES ---
    const ventanaGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const ventanaMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x112244 });
    
    // Ventana izquierda
    const ventL = new THREE.Mesh(ventanaGeo, ventanaMat);
    ventL.position.set(-1.8, 1.5, 2.01);
    oxxoGrupo.add(ventL);

    // Ventana derecha (donde suelen estar los refris)
    const ventR = ventL.clone();
    ventR.position.set(1.8, 1.5, 2.01);
    oxxoGrupo.add(ventR);

    // --- 6. LETRERO (El "Tótem" de afuera) ---
    const posteGeo = new THREE.CylinderGeometry(0.1, 0.1, 6);
    const posteMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const poste = new THREE.Mesh(posteGeo, posteMat);
    poste.position.set(4, 3, 3); // Un poco alejado a la derecha
    oxxoGrupo.add(poste);

    const logoGeo = new THREE.BoxGeometry(1.5, 1, 0.4);
    const logoMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.position.set(4, 5.5, 3);
    oxxoGrupo.add(logo);

    // Pequeño detalle amarillo en el logo del poste
    const logoDetalleGeo = new THREE.BoxGeometry(1.55, 0.2, 0.45);
    const logoDetalleMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    const logoDetalle = new THREE.Mesh(logoDetalleGeo, logoDetalleMat);
    logoDetalle.position.set(4, 5.3, 3);
    oxxoGrupo.add(logoDetalle);

    return oxxoGrupo;
}
