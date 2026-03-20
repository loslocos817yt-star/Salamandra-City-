// js/functions/clima.js
import * as THREE from 'three';

/**
 * Sistema de ciclo día/noche con vibe GTA San Andreas – fog naranja intenso de Los Santos
 * Ciclo completo: 4 minutos (más o menos 2 min día + 2 min noche)
 * Inspirado en el smog naranja clásico de PS2, densidad baja para haze lejana
 */

export class CicloDiaNoche {
    constructor(scene, directionalLight, ambientLight, fog) {
        this.scene = scene;
        this.directionalLight = directionalLight;
        this.ambientLight = ambientLight;
        this.fog = fog;
        
        // Duración del ciclo en milisegundos
        this.duracionCiclo = 4 * 60 * 1000; // 4 minutos
        this.duracionTransicion = 45 * 1000; // transiciones más largas para vibe SA
        
        // Colores GTA SA style – naranja smog everywhere en LS
        this.colores = {
            dia: {
                sky: 0xffe0b0,           // cielo cálido amarillo-naranja
                fog: 0xffaa66,           // NARANJA SMOG CLÁSICO
                ambient: 0.70,
                sun: 1.40,
                sunColor: 0xffd9a3
            },
            atardecer: {
                sky: 0xff7733,
                fog: 0xff5511,           // naranja-rojo fuerte al atardecer
                ambient: 0.40,
                sun: 0.60,
                sunColor: 0xff4400
            },
            noche: {
                sky: 0x0f0f2e,
                fog: 0x1e1e40,           // azul oscuro con toque morado
                ambient: 0.18,
                sun: 0.08,
                sunColor: 0xaabbee
            },
            amanecer: {
                sky: 0xffbb99,
                fog: 0xff9966,
                ambient: 0.45,
                sun: 0.85,
                sunColor: 0xffd088
            }
        };
        
        this.tiempoTranscurrido = 0;
        
        this.currentSky = new THREE.Color(this.colores.dia.sky);
        this.currentFog = new THREE.Color(this.colores.dia.fog);
        this.currentAmbient = this.colores.dia.ambient;
        this.currentSunIntensity = this.colores.dia.sun;
    }
    
    _obtenerFase() {
        const cicloNormalizado = (this.tiempoTranscurrido % this.duracionCiclo) / this.duracionCiclo;
        
        if (cicloNormalizado < 0.40) return 'dia';
        if (cicloNormalizado < 0.55) return 'atardecer';  // atardecer más largo
        if (cicloNormalizado < 0.92) return 'noche';
        return 'amanecer';
    }
    
    _lerpColor(color1, color2, factor) {
        return new THREE.Color(
            color1.r + (color2.r - color1.r) * factor,
            color1.g + (color2.g - color1.g) * factor,
            color1.b + (color2.b - color1.b) * factor
        );
    }
    
    actualizar(deltaTime = 16) {
        this.tiempoTranscurrido += deltaTime;
        const fase = this._obtenerFase();
        const cicloNormalizado = (this.tiempoTranscurrido % this.duracionCiclo) / this.duracionCiclo;
        
        let targetSky, targetFog, targetAmbient, targetSunIntensity, targetSunColor;
        let targetFogDensity = 0.00065; // baja para ver lejana la ciudad con haze naranja
        
        switch(fase) {
            case 'dia':
                targetSky = new THREE.Color(this.colores.dia.sky);
                targetFog = new THREE.Color(0xffb366); // naranja GTA icónico, un poco más saturado
                targetAmbient = this.colores.dia.ambient;
                targetSunIntensity = this.colores.dia.sun;
                targetSunColor = new THREE.Color(0xffd9a3);
                
                // Variación sutil como en SA (smog más fuerte al "mediodía")
                const osc = Math.sin(cicloNormalizado * Math.PI * 5) * 0.0002;
                targetFogDensity = 0.00055 + osc; // ~0.00035 a 0.00075
                break;
                
            case 'atardecer':
                const tAt = (cicloNormalizado - 0.40) / 0.15;
                targetSky = this._lerpColor(
                    new THREE.Color(this.colores.dia.sky),
                    new THREE.Color(this.colores.atardecer.sky),
                    tAt
                );
                targetFog = this._lerpColor(
                    new THREE.Color(0xffaa66),
                    new THREE.Color(this.colores.atardecer.fog),
                    tAt
                );
                targetAmbient = THREE.MathUtils.lerp(this.colores.dia.ambient, this.colores.atardecer.ambient, tAt);
                targetSunIntensity = THREE.MathUtils.lerp(this.colores.dia.sun, this.colores.atardecer.sun, tAt);
                targetSunColor = this._lerpColor(
                    new THREE.Color(this.colores.dia.sunColor),
                    new THREE.Color(this.colores.atardecer.sunColor),
                    tAt
                );
                targetFogDensity = 0.0010;
                break;
                
            case 'noche':
                targetSky = new THREE.Color(this.colores.noche.sky);
                targetFog = new THREE.Color(this.colores.noche.fog);
                targetAmbient = this.colores.noche.ambient;
                targetSunIntensity = this.colores.noche.sun;
                targetSunColor = new THREE.Color(this.colores.noche.sunColor);
                targetFogDensity = 0.0014;
                break;
                
            case 'amanecer':
                const tAm = (cicloNormalizado - 0.92) / 0.08;
                targetSky = this._lerpColor(
                    new THREE.Color(this.colores.noche.sky),
                    new THREE.Color(this.colores.amanecer.sky),
                    tAm
                );
                targetFog = this._lerpColor(
                    new THREE.Color(this.colores.noche.fog),
                    new THREE.Color(0xffaa77),
                    tAm
                );
                targetAmbient = THREE.MathUtils.lerp(this.colores.noche.ambient, this.colores.amanecer.ambient, tAm);
                targetSunIntensity = THREE.MathUtils.lerp(this.colores.noche.sun, this.colores.amanecer.sun, tAm);
                targetSunColor = this._lerpColor(
                    new THREE.Color(this.colores.noche.sunColor),
                    new THREE.Color(this.colores.amanecer.sunColor),
                    tAm
                );
                targetFogDensity = 0.0008;
                break;
        }
        
        // Suavizado más vivo (como cambios en SA)
        const suavizado = 0.045;
        
        this.currentSky.lerp(targetSky, suavizado);
        this.currentFog.lerp(targetFog, suavizado * 1.3); // fog reacciona más rápido
        this.currentAmbient = THREE.MathUtils.lerp(this.currentAmbient, targetAmbient, suavizado);
        this.currentSunIntensity = THREE.MathUtils.lerp(this.currentSunIntensity, targetSunIntensity, suavizado);
        
        // Aplicar
        if (this.scene) {
            this.scene.background = this.currentSky.clone();
        }
        
        if (this.fog) {
            this.fog.color.copy(this.currentFog);
            this.fog.density = THREE.MathUtils.lerp(this.fog.density || 0.0006, targetFogDensity, 0.06);
        }
        
        if (this.ambientLight) {
            this.ambientLight.intensity = this.currentAmbient;
        }
        
        if (this.directionalLight) {
            this.directionalLight.intensity = this.currentSunIntensity;
            this.directionalLight.color.lerp(targetSunColor, suavizado);
        }
    }
    
    obtenerFaseActual() {
        return this._obtenerFase();
    }
}