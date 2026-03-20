import * as THREE from 'three';
import { crearCasa } from '../modelos/casa.js';
import { crearEdificio } from '../modelos/edificio.js';
import { crearArbol } from '../modelos/arbol.js';
import { crearArbusto } from '../modelos/arbusto.js';
import { crearArma } from '../modelos/arma.js';
import { crearAuto } from '../modelos/auto.js';

export function generarMapa(scene, casas, edificios, lootsEnMapa) {
    const aceraGrid = new Set();
    let miAuto = null;
    
    // NUEVO: Guardaremos las zonas de agua para detectar cuándo cae el jugador y rebotarlo
    const zonasAgua = []; 

    const mapImg = new Image();
    mapImg.src = './map/map.png'; 

    mapImg.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = mapImg.width;
        canvas.height = mapImg.height;
        ctx.drawImage(mapImg, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const sep = 5; 

        // --- MATERIALES NUEVOS ---
        
        // AGUA CHINGONA: Transparente, reflectante y azul profundo
        const matAgua = new THREE.MeshPhysicalMaterial({
            color: 0x00aaff,      // Azul cyan muy vivo
            transparent: true,    // Habilitar transparencia
            opacity: 0.6,         // Nivel de transparencia
            roughness: 0.1,       // Casi nada rasposo (refleja chido)
            transmission: 0.8,    // Efecto cristalino/agua
            thickness: 1.0        // Grosor simulado para refracción
        });

        const matAcera = new THREE.MeshStandardMaterial({ color: 0x8a8a8a });
        const geoPlano = new THREE.PlaneGeometry(sep, sep);
        
        // NUEVA GEOMETRÍA: Cilindro en lugar de Caja.
        // Al usar un radio de (sep * 0.55), los bloques se solapan un poquito.
        // Esto mata las esquinas cuadradas y hace que las orillas se vean redondeadas.
        // Altura total: 1.0 (como pediste de límite).
        const geoAgua = new THREE.CylinderGeometry(sep * 0.55, sep * 0.55, 0.1, 16); 

        const colorCercano = (r1, g1, b1, r2, g2, b2) => {
            return Math.abs(r1 - r2) <= 8 && Math.abs(g1 - g2) <= 8 && Math.abs(b1 - b2) <= 8;
        };

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];

                if (a < 128) continue; 

                const px = (x - canvas.width / 2) * sep;
                const pz = (y - canvas.height / 2) * sep;
                let obj = null;

                // --- MONTAÑAS (0, 179, 8) -> #00B308 ---
                if (colorCercano(r, g, b, 0, 179, 8)) {
                    const altura = 5 + Math.random() * 15; 
                    const geoMontaña = new THREE.BoxGeometry(sep, altura, sep);
                    
                    const colors = [];
                    const colorPiedra = new THREE.Color(0x888888);
                    const colorPasto = new THREE.Color(0x228B22);
                    
                    const posicionAtributo = geoMontaña.attributes.position;
                    for (let j = 0; j < posicionAtributo.count; j++) {
                        if (posicionAtributo.getY(j) > 0) {
                            colors.push(colorPiedra.r, colorPiedra.g, colorPiedra.b);
                        } else {
                            colors.push(colorPasto.r, colorPasto.g, colorPasto.b);
                        }
                    }
                    geoMontaña.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                    
                    const matMontaña = new THREE.MeshStandardMaterial({ 
                        vertexColors: true, 
                        roughness: 0.9 
                    });
                    
                    obj = new THREE.Mesh(geoMontaña, matMontaña);
                    obj.position.y = altura / 2; 
                }
                // --- AGUA NUEVA Y FUNCIONAL (Bordes Redondeados) ---
                else if (colorCercano(r, g, b, 0, 204, 255)) {
                    obj = new THREE.Mesh(geoAgua, matAgua);
                    
                    // Altura a 0.0: Como el bloque mide 1.0 de alto, la mitad (0.5) 
                    // queda incrustada bajo tierra y la otra mitad (0.5) sobresale. 
                    // Así se ve claramente pero sin ser un muro.
                    obj.position.y = 0.0; 
                    
                    // Le ponemos una etiqueta para reconocerla después
                    obj.userData = { esAgua: true, fuerzaRebote: 0.5 };
                    zonasAgua.push(obj); 
                }
                // ACERA
                else if (colorCercano(r, g, b, 138, 138, 138)) {
                    obj = new THREE.Mesh(geoPlano, matAcera);
                    obj.rotation.x = -Math.PI / 2;
                    obj.position.y = 0.01;
                    aceraGrid.add(`${Math.round(px)},${Math.round(pz)}`);

                    if (!miAuto) {
                        miAuto = crearAuto();
                        miAuto.position.set(px, 0.1, pz);
                        scene.add(miAuto);
                    }
                }
                // RESTO DE OBJETOS
                else if (colorCercano(r, g, b, 208, 255, 0)) { obj = crearCasa(); casas.push({ mesh: obj, radio: 1.8 }); }
                else if (colorCercano(r, g, b, 255, 0, 0)) { obj = crearEdificio(); edificios.push({ mesh: obj, radio: 2.5 }); }
                else if (colorCercano(r, g, b, 0, 0, 255)) { obj = crearArma(); lootsEnMapa.push(obj); }
                else if (colorCercano(r, g, b, 111, 78, 55)) { obj = crearArbol(); }
                else if (colorCercano(r, g, b, 173, 235, 179)) { obj = crearArbusto(); }
                
                // --- ESPACIO VACÍO (Generación aleatoria de vegetación) ---
                else {
                    const azar = Math.random();
                    if (azar < 0.10) { 
                        obj = crearArbol();
                    } else if (azar < 0.25) { 
                        obj = crearArbusto();
                    }
                }

                if (obj) {
                    // Respetamos la altura 'y' que definimos arriba para cada cosa
                    obj.position.set(px, obj.position.y, pz);
                    scene.add(obj);
                }
            }
        }
        console.log("--- ¡Montañas Generadas y Mundo Listo! ---");
    };

    return {
        zonasAgua: zonasAgua, 

        actualizar: (joystickMov) => { 
            if (miAuto && joystickMov) {
                const vel = 0.25;
                const nx = miAuto.position.x + (joystickMov.x * vel);
                const nz = miAuto.position.z - (joystickMov.y * vel);
                const gridX = Math.round(nx / 5) * 5;
                const gridZ = Math.round(nz / 5) * 5;

                if (aceraGrid.has(`${gridX},${gridZ}`)) {
                    miAuto.position.x = nx;
                    miAuto.position.z = nz;
                    if (Math.abs(joystickMov.x) > 0.1 || Math.abs(joystickMov.y) > 0.1) {
                        miAuto.rotation.y = Math.atan2(joystickMov.x, joystickMov.y);
                    }
                    if (miAuto.userData.actualizarLlantas) {
                        miAuto.userData.actualizarLlantas(0.15);
                    }
                }
            }
        }
    };
}