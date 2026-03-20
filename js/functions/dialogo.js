// js/functions/dialogo.js

/**
 * Sistema de diálogos para NPCs
 * - Muestra UI con mensaje inicial y opciones
 * - Soporta teclado (E) y toque en móvil
 * - Fácil de expandir con misiones, items, etc.
 */

export class SistemaDialogo {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.activo = false;
        this.npcActual = null;
        this.datosDialogo = null;
        
        // Crear UI del diálogo (inyectada en el DOM)
        this._crearUI();
    }
    
    _crearUI() {
        // Contenedor principal (oculto por defecto)
        this.ui = document.createElement('div');
        this.ui.id = 'ui-dialogo';
        this.ui.style.cssText = `
            position: fixed;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            width: min(90vw, 500px);
            background: rgba(0, 0, 0, 0.85);
            border: 2px solid #44ccff;
            border-radius: 12px;
            padding: 15px;
            color: white;
            font-family: sans-serif;
            font-size: 14px;
            z-index: 2000;
            display: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        
        // Mensaje del NPC
        this.mensajeNPC = document.createElement('div');
        this.mensajeNPC.style.cssText = `
            margin-bottom: 12px;
            padding: 10px;
            background: rgba(68, 204, 255, 0.15);
            border-radius: 8px;
            min-height: 40px;
        `;
        
        // Contenedor de opciones
        this.opcionesContainer = document.createElement('div');
        this.opcionesContainer.id = 'opciones-dialogo';
        this.opcionesContainer.style.display = 'flex';
        this.opcionesContainer.style.flexDirection = 'column';
        this.opcionesContainer.style.gap = '8px';
        
        // Indicador de cerrar (tecla E o toque)
        this.ayuda = document.createElement('div');
        this.ayuda.style.cssText = `
            margin-top: 10px;
            font-size: 11px;
            color: #aaa;
            text-align: center;
        `;
        this.ayuda.textContent = 'Presiona E o toca fuera para cerrar';
        
        // Ensamblar UI
        this.ui.appendChild(this.mensajeNPC);
        this.ui.appendChild(this.opcionesContainer);
        this.ui.appendChild(this.ayuda);
        this.domElement.appendChild(this.ui);
        
        // Cerrar al tocar fuera del diálogo
        this.domElement.addEventListener('touchstart', (e) => this._manejarCierreExterno(e));
        this.domElement.addEventListener('mousedown', (e) => this._manejarCierreExterno(e));
        
        // Cerrar con tecla E
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e' && this.activo) {
                this.cerrar();
            }
        });
    }
    
    _manejarCierreExterno(e) {
        if (!this.activo) return;
        // Si el click/toque NO fue dentro del UI, cerrar
        if (!this.ui.contains(e.target))
