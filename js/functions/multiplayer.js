import * as THREE from 'three';
import { crearSalamandra } from '../modelos/salamandra.js';

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
            console.log("%c[NET] Entrando a la sala de tu compa...", "color: #ffff00;");
            this.conectarA(room);
            // Limpia la URL para que no se reconecte al recargar
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
            console.log("%c[NET] Una nueva Salamandra entró al mundo", "color: #ff00ff;");
            const clon = crearSalamandra();
            this.scene.add(clon);
            this.otrosJugadores[d.id] = clon;
        }
        const p = this.otrosJugadores[d.id];
        p.position.set(d.x, d.y, d.z);
        p.rotation.y = d.rot;
    }

    enviarMiPosicion() {
        if (this.conexiones.length === 0) return;
        const data = {
            id: this.peer.id,
            x: this.jugadorPrincipal.position.x,
            y: this.jugadorPrincipal.position.y,
            z: this.jugadorPrincipal.position.z,
            rot: this.jugadorPrincipal.rotation.y
        };
        this.conexiones.forEach(c => { if (c.open) c.send(data); });
    }
}
