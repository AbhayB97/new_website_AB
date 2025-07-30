// Three.js Scene Manager - Handles 3D laptop model and animations
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EventEmitter } from './EventEmitter.js';

export class SceneManager extends EventEmitter {
    constructor() {
        super();
        
        // Three.js core objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        
        // Animation and control
        this.animationId = null;
        this.clock = new THREE.Clock();
        this.isAnimating = true;
        this.isTourMode = false;
        
        // 3D Model
        this.laptopModel = null;
        this.laptopParts = new Map();
        this.originalPositions = new Map();
        this.originalRotations = new Map();
        
        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPart = null;
        
        // Scroll and progress
        this.scrollProgress = 0;
        this.disassemblyTimeline = null;
        
        // Background effects
        this.particleSystem = null;
        this.backgroundGrid = null;
        
        // Performance
        this.isVisible = true;
    }
    
    async init() {
        try {
            console.log('🎬 Initializing 3D Scene...');
            
            // Setup canvas and renderer
            this.setupCanvas();
            this.setupRenderer();
            
            // Setup scene and camera
            this.setupScene();
            this.setupCamera();
            this.setupLights();
            
            // Load 3D model
            await this.loadLaptopModel();
            
            // Setup background effects
            this.setupBackgroundEffects();
            
            // Setup interaction
            this.setupInteraction();
            
            // Start render loop
            this.startRenderLoop();
            
            console.log('✅ 3D Scene initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize 3D scene:', error);
            throw error;
        }
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('main-canvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 10, 50);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Position camera to view laptop
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0x00ff41, 1);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Accent lights for neon effect
        const accentLight1 = new THREE.PointLight(0x00ff41, 0.5, 10);
        accentLight1.position.set(-3, 2, 3);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0x0088ff, 0.3, 8);
        accentLight2.position.set(3, 1, -2);
        this.scene.add(accentLight2);
    }
    
    async loadLaptopModel() {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            
            // For demo purposes, we'll create a simple laptop from primitives
            // In production, you would load: loader.load('/models/laptop.glb', ...)
            this.createLaptopFromPrimitives();
            resolve();
        });
    }
    
    createLaptopFromPrimitives() {
        const laptopGroup = new THREE.Group();
        laptopGroup.name = 'laptop';
        
        // Create laptop parts
        const parts = {
            screen: this.createScreen(),
            keyboard: this.createKeyboard(),
            battery: this.createBattery(),
            ports: this.createPorts(),
            motherboard: this.createMotherboard()
        };
        
        // Add parts to laptop group and store references
        Object.entries(parts).forEach(([name, part]) => {
            part.name = name;
            part.userData = { partName: name };
            laptopGroup.add(part);
            this.laptopParts.set(name, part);
            
            // Store original positions and rotations
            this.originalPositions.set(name, part.position.clone());
            this.originalRotations.set(name, part.rotation.clone());
        });
        
        this.laptopModel = laptopGroup;
        this.scene.add(laptopGroup);
        
        // Setup disassembly animation
        this.setupDisassemblyAnimation();
    }
    
    createScreen() {
        const geometry = new THREE.BoxGeometry(3, 2, 0.1);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.9
        });
        const screen = new THREE.Mesh(geometry, material);
        screen.position.set(0, 1.5, -1.5);
        screen.rotation.x = -Math.PI * 0.1;
        screen.castShadow = true;
        screen.receiveShadow = true;
        
        // Add screen glow effect
        const glowGeometry = new THREE.BoxGeometry(2.8, 1.8, 0.05);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff41,
            transparent: true,
            opacity: 0.3
        });
        const screenGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        screenGlow.position.z = 0.01;
        screen.add(screenGlow);
        
        return screen;
    }
    
    createKeyboard() {
        const geometry = new THREE.BoxGeometry(3, 0.1, 2);
        const material = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        const keyboard = new THREE.Mesh(geometry, material);
        keyboard.position.set(0, 0, 0);
        keyboard.castShadow = true;
        keyboard.receiveShadow = true;
        
        // Add keys
        const keyGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.2);
        const keyMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
        
        for (let x = -1.2; x <= 1.2; x += 0.3) {
            for (let z = -0.8; z <= 0.8; z += 0.3) {
                const key = new THREE.Mesh(keyGeometry, keyMaterial);
                key.position.set(x, 0.08, z);
                keyboard.add(key);
            }
        }
        
        return keyboard;
    }
    
    createBattery() {
        const geometry = new THREE.BoxGeometry(2, 0.3, 0.5);
        const material = new THREE.MeshLambertMaterial({ color: 0x1a4a1a });
        const battery = new THREE.Mesh(geometry, material);
        battery.position.set(0, -0.2, 0.8);
        battery.castShadow = true;
        return battery;
    }
    
    createPorts() {
        const portsGroup = new THREE.Group();
        
        // USB ports
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.BoxGeometry(0.3, 0.1, 0.1);
            const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const port = new THREE.Mesh(geometry, material);
            port.position.set(-1.5, 0.05, -0.5 + i * 0.3);
            portsGroup.add(port);
        }
        
        portsGroup.position.set(0, 0, 0);
        return portsGroup;
    }
    
    createMotherboard() {
        const geometry = new THREE.BoxGeometry(2.5, 0.05, 1.5);
        const material = new THREE.MeshLambertMaterial({ color: 0x0d5f0d });
        const motherboard = new THREE.Mesh(geometry, material);
        motherboard.position.set(0, -0.3, 0);
        motherboard.castShadow = true;
        
        // Add circuit traces
        const traceGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1);
        const traceMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff41 });
        
        for (let i = 0; i < 10; i++) {
            const trace = new THREE.Mesh(traceGeometry, traceMaterial);
            trace.position.set(
                (Math.random() - 0.5) * 2,
                0.03,
                (Math.random() - 0.5) * 1.2
            );
            trace.rotation.z = Math.random() * Math.PI;
            motherboard.add(trace);
        }
        
        return motherboard;
    }
    
    setupDisassemblyAnimation() {
        // Import anime.js dynamically
        import('https://cdn.skypack.dev/animejs@3.2.1').then(({ default: anime }) => {
            this.anime = anime;
            
            // Create disassembly timeline (paused by default)
            this.disassemblyTimeline = anime.timeline({
                autoplay: false,
                duration: 1000,
                easing: 'easeOutExpo'
            });
            
            // Animate each part moving away from center
            this.laptopParts.forEach((part, name) => {
                const direction = this.getDisassemblyDirection(name);
                
                this.disassemblyTimeline.add({
                    targets: part.position,
                    x: direction.x,
                    y: direction.y,
                    z: direction.z,
                    duration: 1000,
                    delay: anime.stagger(200) // Stagger the animations
                }, 0);
                
                // Add rotation animation
                this.disassemblyTimeline.add({
                    targets: part.rotation,
                    x: part.rotation.x + direction.rotX,
                    y: part.rotation.y + direction.rotY,
                    z: part.rotation.z + direction.rotZ,
                    duration: 1000
                }, 0);
            });
        });
    }
    
    getDisassemblyDirection(partName) {
        const directions = {
            screen: { x: 0, y: 3, z: -3, rotX: -0.5, rotY: 0, rotZ: 0 },
            keyboard: { x: 0, y: -2, z: 2, rotX: 0.3, rotY: 0, rotZ: 0 },
            battery: { x: -3, y: -1, z: 2, rotX: 0, rotY: 0.5, rotZ: 0.2 },
            ports: { x: -4, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0.3 },
            motherboard: { x: 2, y: -2, z: 1, rotX: 0.2, rotY: -0.3, rotZ: 0 }
        };
        
        return directions[partName] || { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0 };
    }
    
    setupBackgroundEffects() {
        // Create particle system
        this.createParticleSystem();
        
        // Create background grid
        this.createBackgroundGrid();
    }
    
    createParticleSystem() {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;     // x
            positions[i + 1] = (Math.random() - 0.5) * 20; // y  
            positions[i + 2] = (Math.random() - 0.5) * 20; // z
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00ff41,
            size: 0.02,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }
    
    createBackgroundGrid() {
        const size = 20;
        const divisions = 20;
        const grid = new THREE.GridHelper(size, divisions, 0x00ff41, 0x00ff41);
        grid.position.y = -3;
        grid.material.opacity = 0.1;
        grid.material.transparent = true;
        this.backgroundGrid = grid;
        this.scene.add(grid);
    }
    
    setupInteraction() {
        // Mouse move for hover detection
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('click', this.onMouseClick.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    }
    
    onMouseMove(event) {
        if (!this.isVisible || this.isTourMode) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.checkIntersections();
    }
    
    onMouseClick(event) {
        if (!this.isVisible) return;
        
        const intersectedPart = this.getIntersectedPart();
        if (intersectedPart) {
            this.emit('partClick', intersectedPart.userData.partName, intersectedPart);
        }
    }
    
    onTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        const intersectedPart = this.getIntersectedPart();
        if (intersectedPart) {
            this.emit('partClick', intersectedPart.userData.partName, intersectedPart);
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        // Handle touch move for mobile interaction
    }
    
    checkIntersections() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects(
            Array.from(this.laptopParts.values()),
            true
        );
        
        if (intersects.length > 0) {
            const intersectedPart = intersects[0].object;
            const partName = intersectedPart.userData.partName || 
                           intersectedPart.parent.userData.partName;
            
            if (this.hoveredPart !== partName) {
                // Clear previous hover
                if (this.hoveredPart) {
                    this.emit('partHover', this.hoveredPart, false);
                }
                
                // Set new hover
                this.hoveredPart = partName;
                this.emit('partHover', partName, true);
                this.canvas.style.cursor = 'pointer';
            }
        } else {
            // Clear hover
            if (this.hoveredPart) {
                this.emit('partHover', this.hoveredPart, false);
                this.hoveredPart = null;
                this.canvas.style.cursor = 'default';
            }
        }
    }
    
    getIntersectedPart() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            Array.from(this.laptopParts.values()),
            true
        );
        
        return intersects.length > 0 ? intersects[0].object : null;
    }
    
    updateScrollProgress(progress) {
        this.scrollProgress = Math.max(0, Math.min(1, progress));
        
        if (this.disassemblyTimeline && this.anime) {
            // Update timeline progress based on scroll
            const timelineProgress = this.scrollProgress * this.disassemblyTimeline.duration;
            this.disassemblyTimeline.seek(timelineProgress);
        }
        
        // Update progress bar
        const progressBar = document.getElementById('progress-fill');
        if (progressBar) {
            progressBar.style.width = `${this.scrollProgress * 100}%`;
        }
    }
    
    focusOnPart(partName) {
        const part = this.laptopParts.get(partName);
        if (!part || !this.anime) return;
        
        // Animate camera to focus on the part
        const targetPosition = part.position.clone();
        targetPosition.add(new THREE.Vector3(0, 1, 3));
        
        this.anime({
            targets: this.camera.position,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1000,
            easing: 'easeOutCubic',
            complete: () => {
                this.camera.lookAt(part.position);
            }
        });
    }
    
    enterTourMode() {
        this.isTourMode = true;
        this.canvas.requestPointerLock();
    }
    
    exitTourMode() {
        this.isTourMode = false;
        document.exitPointerLock();
    }
    
    startRenderLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            if (!this.isAnimating || !this.isVisible) return;
            
            const deltaTime = this.clock.getDelta();
            
            // Animate background effects
            if (this.particleSystem) {
                this.particleSystem.rotation.y += deltaTime * 0.1;
            }
            
            // Laptop idle animation (subtle floating)
            if (this.laptopModel && this.scrollProgress < 0.1) {
                this.laptopModel.position.y = Math.sin(this.clock.elapsedTime * 0.5) * 0.05;
                this.laptopModel.rotation.y = Math.sin(this.clock.elapsedTime * 0.3) * 0.02;
            }
            
            // Render the scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
    
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    pause() {
        this.isAnimating = false;
    }
    
    resume() {
        this.isAnimating = true;
    }
    
    setVisibility(visible) {
        this.isVisible = visible;
    }
    
    dispose() {
        // Clean up resources
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Dispose of geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}
