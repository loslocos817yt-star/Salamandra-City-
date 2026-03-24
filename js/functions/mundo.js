/**
 * ============================================================================
 * MÓDULO DE GENERACIÓN DE MAPA Y LÓGICA DE ENTORNO
 * Optimizado para alto rendimiento y prevención de colapsos (Crashes).
 * ============================================================================
 */

import * as THREE from 'three';
import { crearCasa } from '../modelos/casa.js';
import { crearEdificio } from '../modelos/edificio.js';
import { crearArbol } from '../modelos/arbol.js';
import { crearArbusto } from '../modelos/arbusto.js';
import { crearArma } from '../modelos/arma.js';
import { crearAuto } from '../modelos/auto.js';
import { crearAntenaTelecom } from '../modelos/antena_telecom.js'; // <-- IMPORTACIÓN NUEVA

// Inicialización segura de la variable global para no sobreescribirla si ya existe
window.monedasRecolectadas = window.monedasRecolectadas || 0;

/**
 * Función principal para generar el mapa basado en un mapa de píxeles (map.png)
 * @param {THREE.Scene} scene - La escena principal de Three.js
 * @param {Array} casas - Array para almacenar datos de colisión de casas
 * @param {Array} edificios - Array para almacenar datos de colisión de edificios
 * @param {Array} lootsEnMapa - Array para armas u objetos interactivos
 * @param {THREE.Object3D} salamandra - El objeto del jugador (puede ser null al inicio)
 */
export function generarMapa(scene, casas, edificios, lootsEnMapa, salamandra) {
    // Estructuras de datos para el control del entorno
    const aceraGrid = new Set();
    let miAuto = null;
    
    // Zonas de agua para detectar cuándo cae el jugador y rebotarlo
    const zonasAgua = []; 
    
    // Array estricto para gestionar el ciclo de vida de las monedas
    const monedas = []; 

    // Array para gestionar las antenas y sus animaciones de luces
    const antenas = []; // <-- ARRAY NUEVO
    
    // Almacenamos las coordenadas exactas de cada moneda para calcular la separación
    const posicionesMonedasGeneradas = [];

    // --- CONFIGURACIÓN ESTRICTA DE MONEDAS ---
    // 150 unidades/píxeles de separación mínima radial obligatoria
    const DISTANCIA_MINIMA_MONEDAS = 150; 
    
    // Cargador de texturas con manejo de errores nivel Rockstar
    const textureLoader = new THREE.TextureLoader();
    const texturaMoneda = textureLoader.load(
        'recursos/game/moneda.png',
        (textura) => {
            // NearestFilter hace que si la moneda es Pixel Art, no se vea borrosa
            textura.magFilter = THREE.NearestFilter; 
            textura.minFilter = THREE.NearestFilter;
            console.log("%c[Sistema] Textura de moneda cargada exitosamente.", "color: #00ff00; font-weight: bold;");
        },
        undefined,
        (err) => {
            console.error("%c[Error Físico] No se encontró 'recursos/game/moneda.png'. Verifica la ruta.", "color: #ff0000; font-size: 14px;");
        }
    );

    // Motor de lectura de mapa por imagen
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

        // --- MATERIALES PREMIUM ---
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
        
        // CILINDRO PARA AGUA: Suaviza las esquinas y evita el efecto de bloque duro
        const geoAgua = new THREE.CylinderGeometry(sep * 0.55, sep * 0.55, 0.1, 16); 

        // Función utilitaria para tolerancia de color (antialiasing prevention)
        const colorCercano = (r1, g1, b1, r2, g2, b2) => {
            return Math.abs(r1 - r2) <= 8 && Math.abs(g1 - g2) <= 8 && Math.abs(b1 - b2) <= 8;
        };

        // Función de escaneo espacial: Verifica si hay OTRA moneda a menos de 150 píxeles
        const zonaLibreParaMoneda = (x, z) => {
            for (let i = 0; i < posicionesMonedasGeneradas.length; i++) {
                const pos = posicionesMonedasGeneradas[i];
                const deltaX = x - pos.x;
                const deltaZ = z - pos.z;
                // Teorema de Pitágoras para distancia radial real
                const distancia = Math.sqrt((deltaX * deltaX) + (deltaZ * deltaZ));
                
                if (distancia < DISTANCIA_MINIMA_MONEDAS) {
                    return false; // Muy cerca de otra moneda, abortar spawn
                }
            }
            return true; // Zona despejada, se puede spawnear
        };

        // Escaneo de la imagen píxel por píxel
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];

                // Ignorar píxeles transparentes
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
                    obj.position.y = 0.0; 
                    obj.userData = { esAgua: true, fuerzaRebote: 0.5 };
                    zonasAgua.push(obj); 
                }
                // --- ACERA Y GENERACIÓN DE MONEDAS ---
                else if (colorCercano(r, g, b, 138, 138, 138)) {
                    obj = new THREE.Mesh(geoPlano, matAcera);
                    obj.rotation.x = -Math.PI / 2;
                    obj.position.y = 0.01; // Ligeramente elevada para evitar Z-fighting
                    aceraGrid.add(`${Math.round(px)},${Math.round(pz)}`);

                    // Algoritmo estricto de Spawn de Monedas en Acera
                    if (zonaLibreParaMoneda(px, pz)) {
                        const geoMoneda = new THREE.PlaneGeometry(1.5, 1.5); 
                        
                        // MeshBasicMaterial ignora luces, haciéndola brillar siempre
                        const matMoneda = new THREE.MeshBasicMaterial({ 
                            map: texturaMoneda, 
                            transparent: true, 
                            side: THREE.DoubleSide, // Visible desde ambos lados al girar
                            alphaTest: 0.1 // Evita bordes blancos extraños
                        });
                        
                        const monedaObj = new THREE.Mesh(geoMoneda, matMoneda);
                        monedaObj.position.set(px, 0.8, pz); // Altura inicial flotando
                        monedaObj.userData = { 
                            esMoneda: true, 
                            alturaBase: 0.8, // Para la animación de flotar
                            desfaseOnda: Math.random() * Math.PI * 2 // Para que no floten todas igual
                        };
                        
                        scene.add(monedaObj);
                        monedas.push(monedaObj);
                        
                        // Registrar en la cuadrícula de distancias para bloquear spawns cercanos
                        posicionesMonedasGeneradas.push({ x: px, z: pz });
                    }

                    // Spawn del Auto (Solo una vez)
                    if (!miAuto) {
                        miAuto = crearAuto();
                        miAuto.position.set(px, 0.1, pz);
                        scene.add(miAuto);
                    }
                }
                // --- ANTENA DE TELECOMUNICACIONES (NUEVO PÍXEL: MAGENTA) ---
                else if (colorCercano(r, g, b, 255, 0, 255)) { 
                    obj = crearAntenaTelecom(); 
                    // Se añade a colisiones de edificios para que el jugador no la atraviese
                    edificios.push({ mesh: obj, radio: 1.5 }); 
                    antenas.push(obj); // Se guarda en el array para animar sus luces
                }
                // --- RESTO DE OBJETOS (Casas, Edificios, Armas, Vegetación) ---
                else if (colorCercano(r, g, b, 208, 255, 0)) { obj = crearCasa(); casas.push({ mesh: obj, radio: 1.8 }); }
                else if (colorCercano(r, g, b, 255, 0, 0)) { obj = crearEdificio(); edificios.push({ mesh: obj, radio: 2.5 }); }
                else if (colorCercano(r, g, b, 0, 0, 255)) { obj = crearArma(); lootsEnMapa.push(obj); }
                else if (colorCercano(r, g, b, 111, 78, 55)) { obj = crearArbol(); }
                else if (colorCercano(r, g, b, 173, 235, 179)) { obj = crearArbusto(); }
                
                // --- ESPACIO VACÍO (Generación aleatoria procedural de vegetación) ---
                else {
                    const azar = Math.random();
                    if (azar < 0.10) { 
                        obj = crearArbol();
                    } else if (azar < 0.25) { 
                        obj = crearArbusto();
                    }
                }

                // Añadir el objeto a la escena si se creó algo en este píxel
                if (obj) {
                    obj.position.set(px, obj.position.y, pz);
                    scene.add(obj);
                }
            }
        }
        console.log(`%c[Mundo] ¡Mapa Listo! Se generaron ${monedas.length} monedas y ${antenas.length} antenas.`, "color: #00ffff; font-weight: bold;");
    };

    /**
     * Objeto de retorno con las funciones que necesita el Game Loop principal
     */
    return {
        zonasAgua: zonasAgua, 

        /**
         * Función que debe llamarse en cada Frame (requestAnimationFrame)
         * @param {Object} joystickMov - Vector de movimiento del vehículo
         */
        actualizar: (joystickMov) => { 
            
            const tiempoTick = Date.now() * 0.003; // Reloj para animaciones fluidas

            // ====================================================================
            // LÓGICA DE ANTENAS: PARPADEO DE BALIZAS (NUEVO)
            // ====================================================================
            antenas.forEach((antena, index) => {
                // Alterna encendido/apagado usando una onda sinusoidal desfasada por el índice
                const luzEncendida = Math.sin(tiempoTick * 1.5 + index) > 0;
                
                // Busca automáticamente las mallas con material rojo emisivo para hacerlas parpadear
                antena.children.forEach(hijo => {
                    if (hijo.material && hijo.material.emissive && hijo.material.emissive.getHex() === 0xff0000) {
                        hijo.material.emissiveIntensity = luzEncendida ? 3 : 0;
                    }
                });
            });

            // ====================================================================
            // LÓGICA DE MONEDAS: GIRO, FLOTACIÓN Y COLISIONES SEGUROS
            // ====================================================================
            // IMPORTANTE: Recorremos el array de ATRÁS hacia ADELANTE.
            // Esto evita que el motor crashee al usar 'splice' para borrar elementos
            for (let i = monedas.length - 1; i >= 0; i--) {
                const moneda = monedas[i];
                
                // 1. Animación Rockstar: Giro sobre su eje Y
                moneda.rotation.y += 0.04; 
                
                // 2. Animación Rockstar: Flotación suave usando curva Senoidal (Math.sin)
                const offsetFlote = Math.sin(tiempoTick + moneda.userData.desfaseOnda) * 0.15;
                moneda.position.y = moneda.userData.alturaBase + offsetFlote;

                // 3. Sistema Blindado de Colisiones
                // Si 'salamandra' aún no carga en el main.js, usamos window.salamandra como backup.
                // Si de plano no existe, simplemente saltamos la colisión este frame, SIN CRASHEAR.
                const jugadorDetectado = salamandra || window.salamandra;
                
                if (jugadorDetectado && jugadorDetectado.position) {
                    // Calculamos distancia real en 3D
                    const distanciaAlJugador = moneda.position.distanceTo(jugadorDetectado.position);
                    
                    // Si el jugador está a menos de 2 unidades, recogemos la moneda
                    if (distanciaAlJugador < 2) {
                        // A) Quitar visualmente de la escena
                        scene.remove(moneda); 
                        
                        // B) Liberar memoria de geometría y material (Optimización Rockstar)
                        moneda.geometry.dispose();
                        moneda.material.dispose();
                        
                        // C) Sumar a la variable global de forma segura
                        window.monedasRecolectadas += 1; 
                        console.log(`%c[Loot] Moneda recogida. Total: ${window.monedasRecolectadas}`, "color: #ffff00");
                        
                        // D) Eliminarla del array para no procesarla más (seguro gracias al bucle inverso)
                        monedas.splice(i, 1);
                    }
                }
            }

            // ====================================================================
            // LÓGICA DE AUTO Y JOYSTICK
            // ====================================================================
            if (miAuto && joystickMov) {
                const vel = 0.25;
                const nx = miAuto.position.x + (joystickMov.x * vel);
                const nz = miAuto.position.z - (joystickMov.y * vel);
                
                // Sistema de cuadrícula para validar si el auto sigue en la acera
                const gridX = Math.round(nx / 5) * 5;
                const gridZ = Math.round(nz / 5) * 5;

                if (aceraGrid.has(`${gridX},${gridZ}`)) {
                    miAuto.position.x = nx;
                    miAuto.position.z = nz;
                    
                    // Rotar auto basado en la dirección del joystick
                    if (Math.abs(joystickMov.x) > 0.1 || Math.abs(joystickMov.y) > 0.1) {
                        miAuto.rotation.y = Math.atan2(joystickMov.x, joystickMov.y);
                    }
                    
                    // Actualizar físicas de las llantas si existen
                    if (miAuto.userData.actualizarLlantas) {
                        miAuto.userData.actualizarLlantas(0.15);
                    }
                }
            }
        }
    };
                                            }
                                      
