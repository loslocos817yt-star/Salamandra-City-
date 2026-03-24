// ./js/modelos/antena_telecom.js
import * as THREE from 'three';

export function crearAntenaTelecom() {
    const antenaGrupo = new THREE.Group();

    // --- 1. ESTRUCTURA PRINCIPAL (TRUSS) ---
    // Usamos un cilindro de pocos lados para que parezca una torre de celosía sin consumir recursos
    const torreGeo = new THREE.CylinderGeometry(0.3, 0.8, 25, 4); 
    const torreMat = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc, 
        wireframe: true // El wireframe le da el look de rejilla metálica
    });
    const torre = new THREE.Mesh(torreGeo, torreMat);
    torre.position.y = 12.5;
    antenaGrupo.add(torre);

    // Eje central sólido (opcional, para que no sea totalmente transparente)
    const ejeGeo = new THREE.CylinderGeometry(0.1, 0.1, 25, 4);
    const ejeMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const eje = new THREE.Mesh(ejeGeo, ejeMat);
    eje.position.y = 12.5;
    antenaGrupo.add(eje);

    // --- 2. PLATOS DE MICROONDAS (LOS DISCOS BLANCOS) ---
    const platoGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 16);
    const platoMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

    const posicionesPlatos = [
        { y: 18, rotZ: Math.PI / 2, rotY: 0 },
        { y: 15, rotZ: Math.PI / 2, rotY: Math.PI / 2.5 },
        { y: 10, rotZ: Math.PI / 2, rotY: -Math.PI / 4 }
    ];

    posicionesPlatos.forEach(pos => {
        const plato = new THREE.Mesh(platoGeo, platoMat);
        const pivote = new THREE.Group(); // Pivote para alejar el plato del centro
        
        plato.rotation.z = pos.rotZ;
        plato.position.x = 0.8; // Desplazado del centro de la torre
        
        pivote.add(plato);
        pivote.position.y = pos.y;
        pivote.rotation.y = pos.rotY;
        
        antenaGrupo.add(pivote);
    });

    // --- 3. PANELES DE SEÑAL (RECTÁNGULOS) ---
    const panelGeo = new THREE.BoxGeometry(0.4, 2.5, 0.2);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });

    for (let i = 0; i < 3; i++) {
        const panel = new THREE.Mesh(panelGeo, panelMat);
        const angulo = (i * Math.PI * 2) / 3;
        panel.position.set(
            Math.cos(angulo) * 0.6,
            22,
            Math.sin(angulo) * 0.6
        );
        panel.rotation.y = -angulo;
        antenaGrupo.add(panel);
    }

    // --- 4. LUCES DE ADVERTENCIA (BALIZAS ROJAS) ---
    const luzGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const luzMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 2
    });

    const luzPunta = new THREE.Mesh(luzGeo, luzMat);
    luzPunta.position.y = 25.2;
    antenaGrupo.add(luzPunta);

    const luzMedia = new THREE.Mesh(luzGeo, luzMat);
    luzMedia.position.y = 13;
    antenaGrupo.add(luzMedia);

    // --- 5. BASE DE CONCRETO ---
    const baseGeo = new THREE.BoxGeometry(3, 0.8, 3);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.4;
    antenaGrupo.add(base);

    return antenaGrupo;
         }
          
