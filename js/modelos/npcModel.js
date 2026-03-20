import * as THREE from 'three';

export function crearAnimalAleatorio() {
    const tipos = ['raton', 'sapo'];
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    return (tipo === 'raton') ? crearRatonBipedo() : crearSapoBipedo();
}

// Materiales compartidos para ojos
const matOjoNegro = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 });
const matOjoSapo = new THREE.MeshStandardMaterial({ color: 0xeeff00, roughness: 0.1 }); // Amarillo brillante

// --- EL RATÓN ---
function crearRatonBipedo() {
    const grupo = new THREE.Group();
    grupo.name = "Raton";

    // CUERPO
    const cuerpoGeo = new THREE.BoxGeometry(0.12, 0.18, 0.1);
    const cuerpoMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat);
    cuerpo.position.y = 0.18;
    grupo.add(cuerpo);

    // CABEZA
    const cabezaGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const cabezaMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const cabeza = new THREE.Mesh(cabezaGeo, cabezaMat);
    cabeza.position.y = 0.32;
    grupo.add(cabeza);

    // 👀 OJOS DEL RATÓN (Nuevos, negros y pequeños)
    const ojoGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const ojoIzq = new THREE.Mesh(ojoGeo, matOjoNegro);
    ojoIzq.position.set(-0.03, 0.34, 0.04); // Arriba y al frente
    grupo.add(ojoIzq);
    const ojoDer = ojoIzq.clone();
    ojoDer.position.x = 0.03;
    grupo.add(ojoDer);

    // OREJAS
    const orejaGeo = new THREE.BoxGeometry(0.06, 0.06, 0.01);
    const orejaMat = new THREE.MeshStandardMaterial({ color: 0xffaaaa });
    const oIzq = new THREE.Mesh(orejaGeo, orejaMat);
    oIzq.position.set(-0.06, 0.38, 0);
    grupo.add(oIzq);
    const oDer = oIzq.clone();
    oDer.position.x = 0.06;
    grupo.add(oDer);

    // 🦵 PIERNAS (Guardadas para animar)
    const piernaGeo = new THREE.BoxGeometry(0.04, 0.1, 0.04);
    const piernaMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const pIzq = new THREE.Mesh(piernaGeo, piernaMat);
    pIzq.position.set(-0.04, 0.05, 0);
    grupo.add(pIzq);
    const pDer = pIzq.clone();
    pDer.position.x = 0.04;
    grupo.add(pDer);

    // Guardamos las piernas en userData para que npc.js las encuentre
    grupo.userData = { 
        velocidadBase: 0.15, 
        tipo: 'ligero',
        piernaIzq: pIzq, // <--- Importante para la animación
        piernaDer: pDer  // <--- Importante para la animación
    };
    return grupo;
}

// --- EL SAPO ---
function crearSapoBipedo() {
    const grupo = new THREE.Group();
    grupo.name = "Sapo";

    // CUERPO
    const cuerpoGeo = new THREE.BoxGeometry(0.2, 0.15, 0.15);
    const cuerpoMat = new THREE.MeshStandardMaterial({ color: 0x226622 });
    const cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat);
    cuerpo.position.y = 0.15;
    grupo.add(cuerpo);

    // CABEZA
    const cabezaGeo = new THREE.BoxGeometry(0.18, 0.08, 0.12);
    const cabezaMat = new THREE.MeshStandardMaterial({ color: 0x228822 });
    const cabeza = new THREE.Mesh(cabezaGeo, cabezaMat);
    cabeza.position.y = 0.26;
    grupo.add(cabeza);

    // 👀 OJOS DEL SAPO (Mejorados, saltones y amarillos)
    const ojoGeoSapo = new THREE.SphereGeometry(0.03, 8, 8);
    const ojIzq = new THREE.Mesh(ojoGeoSapo, matOjoSapo);
    ojIzq.position.set(-0.06, 0.3, 0.02); // Más saltones hacia el frente
    grupo.add(ojIzq);
    const ojDer = ojIzq.clone();
    ojDer.position.x = 0.06;
    grupo.add(ojDer);

    // 🦵 PIERNAS (Guardadas para animar)
    const piernaGeo = new THREE.BoxGeometry(0.06, 0.08, 0.06);
    const piernaMat = new THREE.MeshStandardMaterial({ color: 0x114411 });
    const pIzq = new THREE.Mesh(piernaGeo, piernaMat);
    pIzq.position.set(-0.07, 0.04, 0);
    grupo.add(pIzq);
    const pDer = pIzq.clone();
    pDer.position.x = 0.07;
    grupo.add(pDer);

    // Guardamos las piernas en userData
    grupo.userData = { 
        velocidadBase: 0.08, 
        tipo: 'pesado',
        piernaIzq: pIzq, // <--- Importante para la animación
        piernaDer: pDer  // <--- Importante para la animación
    };
    return grupo;
}
