import * as THREE from 'three';

/**
 * Crea un vehículo con colores aleatorios y lógica para seguir una ruta.
 * @param {Array} ruta - Arreglo de THREE.Vector3 con los puntos de la ruta morada.
 */
export function crearAuto(ruta = []) {
    const auto = new THREE.Group();

    // 1. PALETA DE COLORES (Vibra de mundo abierto)
    const colores = [
        0xff4444, // Rojo Deportivo
        0x2244ff, // Azul Tuner
        0xeeeeee, // Blanco Perlado
        0x333333, // Negro Mafioso
        0xffcc00, // Amarillo Taxi
        0x44aa44  // Verde Bosque
    ];
    const colorElegido = colores[Math.floor(Math.random() * colores.length)];

    // 2. CUERPO DEL AUTO
    const chasis = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.25, 1),
        new THREE.MeshStandardMaterial({ color: colorElegido, roughness: 0.2, metalness: 0.8 })
    );
    chasis.position.y = 0.2;
    auto.add(chasis);

    const cabina = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.2, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1, roughness: 0.1 })
    );
    cabina.position.set(0, 0.4, -0.1);
    auto.add(cabina);

    // 3. LAS LLANTAS
    const llantas = [];
    const geometryLlanta = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    geometryLlanta.rotateZ(Math.PI / 2); 
    const materialLlanta = new THREE.MeshStandardMaterial({ color: 0x050505 });

    const posLlantas = [
        { x: 0.28, z: 0.3 }, { x: -0.28, z: 0.3 },
        { x: 0.28, z: -0.3 }, { x: -0.28, z: -0.3 }
    ];

    posLlantas.forEach(pos => {
        const llanta = new THREE.Mesh(geometryLlanta, materialLlanta);
        llanta.position.set(pos.x, 0.12, pos.z);
        auto.add(llanta);
        llantas.push(llanta);
    });

    // 4. LÓGICA DE MOVIMIENTO (userData)
    auto.userData = {
        velocidad: 0.05 + Math.random() * 0.05, 
        ruta: ruta, // La lista de puntos que sacamos del mapa
        indicePuntoActual: 0, // En qué punto de la ruta va
        
        actualizar: function() {
            // Si tiene una ruta válida
            if (this.ruta && this.ruta.length > 0) {
                const destino = this.ruta[this.indicePuntoActual];
                
                // Calculamos la distancia y dirección hacia el siguiente punto
                const direccion = new THREE.Vector3().subVectors(destino, auto.position);
                // Ignoramos el eje Y para que no intente volar o hundirse
                direccion.y = 0; 
                
                const distancia = direccion.length();

                // Si ya está muy cerca del punto, pasamos al siguiente
                if (distancia < 0.3) {
                    this.indicePuntoActual++;
                    // Si llegó al final, vuelve al inicio (hace un circuito)
                    if (this.indicePuntoActual >= this.ruta.length) {
                        this.indicePuntoActual = 0;
                    }
                } else {
                    // Normalizamos la dirección para movernos
                    direccion.normalize();
                    auto.position.addScaledVector(direccion, this.velocidad);
                    
                    // Hacer que el carro gire para mirar hacia dónde va
                    const objetivoMirar = new THREE.Vector3().copy(auto.position).add(direccion);
                    auto.lookAt(objetivoMirar);
                    
                    // Animar llantas
                    llantas.forEach(l => {
                        l.rotation.x -= this.velocidad * 8; 
                    });
                }
            } else {
                // Comportamiento de respaldo (línea recta) por si no hay ruta
                auto.position.z += this.velocidad;
                if (auto.position.z > 40) auto.position.z = -40;
                llantas.forEach(l => l.rotation.x -= this.velocidad * 8);
            }
        }
    };

    return auto;
}
