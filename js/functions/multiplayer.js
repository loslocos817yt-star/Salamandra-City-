import * as THREE from 'three';
import { crearSalamandra } from '../modelos/salamandra.js';
import { actualizarAnimacion } from '../animaciones/animacion.js';

export class Multiplayer {
    constructor(scene, jugadorPrincipal) {
        this.scene = scene;
        this.jugadorPrincipal = jugadorPrincipal;
        this.peer = new Peer(); 
        this.otrosJugadores = {};
        this.conexiones = [];

        this.peer.on('open', (id) => {
            window.miIdPeer = id;
            console.log("%c[SALAMANDRA-NET] Sistema en línea. ID: " + id, "color: #00ff00; font-weight: bold;");
            this.checarLink();
        });

        this.peer.on('connection', (conn) => this.setup(conn));
    }

    checarLink() {
        const urlParams = new URLSearchParams(window.location.search);
        const room = urlParams.get('sala');
        if (room) {
            this.conectarA(room);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    conectarA(id) {
        const conn = this.peer.connect(id);
        this.setup(conn);
    }

    setup(conn) {
        conn.on('open', () => {
            console.log("%c[NET] ¡CONEXIÓN ESTABLECIDA!", "color: #00ffff; font-weight: bold;");
            this.conexiones.push(conn);
            conn.on('data', (d) => this.update(d));
        });
    }

    update(d) {
        if (!this.otrosJugadores[d.id]) {
            console.log("%c[NET] Nueva Salamandra detectada", "color: #ff00ff;");
            const clon = crearSalamandra();
            this.scene.add(clon);
            this.otrosJugadores[d.id] = { modelo: clon, moviendose: false };
        }
        const pj = this.otrosJugadores[d.id];
        pj.modelo.position.set(d.x, d.y, d.z);
        pj.modelo.rotation.y = d.rot;
        pj.moviendose = d.andando; // Guardamos si el otro se mueve
    }

    // Función para que los clones respiren y caminen
    actualizarClones() {
        Object.values(this.otrosJugadores).forEach(pj => {
            actualizarAnimacion(pj.modelo, pj.moviendose);
        });
    }

    enviarMiPosicion(andando) {
        if (this.conexiones.length === 0) return;
        const data = {
            id: this.peer.id,
            x: this.jugadorPrincipal.position.x,
            y: this.jugadorPrincipal.position.y,
            z: this.jugadorPrincipal.position.z,
            rot: this.jugadorPrincipal.rotation.y,
            andando: andando // Enviamos nuestro estado actual
        };
        this.conexiones.forEach(c => { if (c.open) c.send(data); });
    }
}
