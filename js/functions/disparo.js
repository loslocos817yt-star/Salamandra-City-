import * as THREE from 'three';
import { crearCasa } from '../modelos/casa.js';
import { crearEdificio } from '../modelos/edificio.js';
import { crearArbol } from '../modelos/arbol.js';
import { crearArbusto } from '../modelos/arbusto.js';
import { crearArma } from '../modelos/arma.js';
import { crearTienda } from '../modelos/puestos/tienda.js'; // Asegúrate que la ruta sea esta
import { SistemaNPC } from './npc.js';

export function generarMapa(scene, casas, edificios, lootsEnMapa) {
    console.log("Iniciando generación de mapa...");
    
    const loader = new THREE.TextureLoader();
    const aceraTex = loader.load('recursos/texturas/acera.jpg');
    aceraTex.wrapS = aceraTex.wrapT = THREE.RepeatWrapping;

    const lootBase = new THREE.Group();
    const aS = crearArma(); aS.scale.set(1.5, 1.5, 1.5);
    const aura = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.01, 16, 100), 
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 })
    );
    aura.rotation.x = Math.PI/2;
    lootBase.add(aS, aura);

    const sep = 5;
    const sistemaNPC = new SistemaNPC(scene, sep);

    // 1. CARGAR MAPA VISUAL
    const mapImg = new Image();
    mapImg.src = 'map/map.png'; 
    
    mapImg.onload = () => {
        console.log("Imagen map.png cargada con éxito");
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = mapImg.width; 
        canvas.height = mapImg.height;
        ctx.drawImage(mapImg, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                if (data[i+3] < 100) continue; // Ignorar transparente

                const px = (x - canvas.width / 2) * sep;
                const pz = (y - canvas.height / 2) * sep;
                const r = data[i], g = data[i+1], b = data[i+2];

                // --- DETECCIÓN DE ENTIDADES POR COLOR ---
                
                // EDIFICIO (Rojo: 255, 0, 0)
                if (r === 255 && g === 0 && b === 0) {
                    const ed = crearEdificio(); ed.position.set(px, 0, pz); 
                    scene.add(ed); edificios.push({ mesh: ed, radio: 4.2 });
                } 
                // ÁRBOL (Café: 111, 78, 55)
                else if (r === 111 && g === 78 && b === 55) {
                    const ar = crearArbol(); ar.position.set(px, 0, pz); 
                    scene.add(ar); casas.push({ mesh: ar, radio: 0.5 });
                } 
                // ARBUSTO (Verde claro: 173, 235, 179)
                else if (r === 173 && g === 235 && b === 179) {
                    const ab = crearArbusto(); ab.position.set(px, 0, pz); scene.add(ab);
                } 
                // CASA (Amarillo: 208, 255, 0)
                else if (r === 208 && g === 255 && b === 0) {
                    const ca = crearCasa(); ca.position.set(px, 0, pz); 
                    scene.add(ca); casas.push({ mesh: ca, radio: 1.2 });
                } 
                // TIENDA (Cian: 0, 206, 200) -> Color #00CEC8
                else if (r === 0 && g === 206 && b === 200) {
                    const ti = crearTienda(); 
                    if (ti) {
                        ti.position.set(px, 0, pz); 
                        scene.add(ti); 
                        casas.push({ mesh: ti, radio: 1.5 });
                    }
                } 
                // ACERA (Gris: 138, 138, 138)
                else if (r === 138 && g === 138 && b === 138) {
                    const ac = new THREE.Mesh(new THREE.PlaneGeometry(sep, sep), new THREE.MeshStandardMaterial({ map: aceraTex }));
                    ac.rotation.x = -Math.PI / 2; ac.position.set(px, 0.02, pz); scene.add(ac);
                } 
                // MURO/MONOLITO (Verde oscuro: 0, 179, 8)
                else if (r === 0 && g === 179 && b === 8) {
                    const mon = new THREE.Mesh(new THREE.BoxGeometry(sep, 12, sep), new THREE.MeshStandardMaterial({ color: 0x007a05 }));
                    mon.position.set(px, 6, pz); scene.add(mon); casas.push({ mesh: mon, radio: 2.5 });
                } 
                // LOOT (Azul: 0, 0, 255)
                else if (r === 0 && g === 0 && b === 255) {
                    const lt = lootBase.clone(); lt.position.set(px, 0.5, pz); 
                    scene.add(lt); lootsEnMapa.push(lt);
                }
            }
        }
        console.log("Mapa visual generado.");
    };

    mapImg.onerror = () => console.error("Error crítico: No se pudo cargar map/map.png");

    // 2. CARGAR RUTAS DE PEATONES
    const pedImg = new Image();
    pedImg.src = 'map/peatones.png';
    pedImg.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = pedImg.width; canvas.height = pedImg.height;
        ctx.drawImage(pedImg, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        sistemaNPC.cargarRutas(data, canvas.width, canvas.height);
        console.log("Rutas de NPCs cargadas.");
    };

    return sistemaNPC;
}
