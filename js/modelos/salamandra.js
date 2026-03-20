import * as THREE from 'three';

// Esta función crea el patrón de manchas amarillas y negras
function generarTexturaPiel() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Fondo Negro/Oscuro
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar manchas amarillas aleatorias
    ctx.fillStyle = '#ffcc00';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radioX = 5 + Math.random() * 20;
        const radioY = 5 + Math.random() * 15;
        const rotacion = Math.random() * Math.PI;

        ctx.beginPath();
        ctx.ellipse(x, y, radioX, radioY, rotacion, 0, 2 * Math.PI);
        ctx.fill();
    }

    const textura = new THREE.CanvasTexture(canvas);
    return textura;
}

export function crearSalamandra() {
    const grupo = new THREE.Group();
    
    // Creamos el material con la textura de manchas
    const texturaPiel = generarTexturaPiel();
    const mat = new THREE.MeshStandardMaterial({ 
        map: texturaPiel, 
        roughness: 0.6 
    });

    // Cuerpo principal
    const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.05, 4, 8), mat);
    cuerpo.position.y = 0.05;
    grupo.add(cuerpo);

    // Cabeza un poco inclinada hacia adelante
    const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), mat);
    cabeza.position.set(0, 0.1, 0.01);
    grupo.add(cabeza);

    // Ojos saltones (Negros brillantes)
    const ojoMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 });
    const ojoL = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), ojoMat);
    const ojoR = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), ojoMat);
    ojoL.position.set(0.012, 0.11, 0.022);
    ojoR.position.set(-0.012, 0.11, 0.022);
    grupo.add(ojoL, ojoR);

    // Cola segmentada (también con la textura de manchas)
    const colaSegmentos = [];
    for (let i = 0; i < 5; i++) {
        const seg = new THREE.Mesh(new THREE.SphereGeometry(0.015 - (i * 0.002), 6, 6), mat);
        seg.position.set(0, 0.02, -0.015 - (i * 0.02));
        grupo.add(seg);
        colaSegmentos.push(seg);
    }

    grupo.userData = { colaSegmentos, fase: 0 };
    return grupo;
}

