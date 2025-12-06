// ====================================
// 3D EARTH GLOBE WITH THREE.JS
// ====================================

let globeScene, globeCamera, globeRenderer, earthMesh;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let currentRotationX = 0, currentRotationY = 0;

function initGlobe() {
    const container = document.getElementById('globeContainer');
    if (!container) return;

    // Scene setup
    globeScene = new THREE.Scene();
    globeScene.background = new THREE.Color(0x000000);
    globeScene.fog = new THREE.Fog(0x000000, 100, 2000);

    // Camera setup
    globeCamera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        2000
    );
    globeCamera.position.z = 500;

    // Renderer setup
    globeRenderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    globeRenderer.setSize(container.clientWidth, container.clientHeight);
    globeRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(globeRenderer.domElement);

    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(200, 64, 64);

    // Earth texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Day texture (Earth surface)
    const earthTexture = textureLoader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
        () => {
            // Texture loaded
        },
        undefined,
        (err) => {
            console.warn('Earth texture failed to load, using fallback');
            // Fallback: create procedural texture
            createProceduralEarth();
        }
    );

    // Night lights texture
    const nightTexture = textureLoader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.jpg',
        () => {},
        undefined,
        () => {
            // Fallback: create glowing night lights
            createProceduralNightLights();
        }
    );

    // Normal map for terrain
    const normalTexture = textureLoader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
        () => {},
        undefined,
        () => {}
    );

    // Earth material with day/night blending
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        normalMap: normalTexture,
        emissive: new THREE.Color(0x001122),
        emissiveMap: nightTexture,
        emissiveIntensity: 0.8,
        shininess: 10,
        transparent: false
    });

    // Create Earth mesh
    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeScene.add(earthMesh);

    // Atmospheric glow
    const atmosphereGeometry = new THREE.SphereGeometry(205, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            c: { value: 0.3 },
            p: { value: 2.0 },
            glowColor: { value: new THREE.Color(0x00D9FF) },
            viewVector: { value: globeCamera.position }
        },
        vertexShader: `
            uniform vec3 viewVector;
            uniform float c;
            uniform float p;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize(normalMatrix * normal);
                vec3 vNormel = normalize(normalMatrix * viewVector);
                intensity = pow(c - dot(vNormal, vNormel), p);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4(glow, 1.0);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeScene.add(atmosphere);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 2,
        transparent: true,
        opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    globeScene.add(stars);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    globeScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(5, 3, 5);
    globeScene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00D9FF, 0.5, 1000);
    pointLight.position.set(200, 200, 200);
    globeScene.add(pointLight);

    // Mouse interaction
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // Auto-rotation
    animateGlobe();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createProceduralEarth() {
    // Fallback procedural Earth if texture fails
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create ocean base
    ctx.fillStyle = '#1a3a5c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add continents (simplified)
    ctx.fillStyle = '#2d5016';
    // Simplified continent shapes
    ctx.beginPath();
    ctx.ellipse(400, 300, 200, 150, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createProceduralNightLights() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create night lights pattern
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add city lights (yellow/white dots)
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function onMouseMove(event) {
    const container = document.getElementById('globeContainer');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    
    targetRotationY = mouseX * 0.3;
    targetRotationX = -mouseY * 0.3;
}

function onMouseLeave() {
    targetRotationX = 0;
    targetRotationY = 0;
}

function animateGlobe() {
    requestAnimationFrame(animateGlobe);

    if (!globeScene || !globeCamera || !globeRenderer || !earthMesh) return;

    // Smooth rotation interpolation
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;

    // Auto-rotate
    earthMesh.rotation.y += 0.002;
    earthMesh.rotation.x += currentRotationX;
    earthMesh.rotation.y += currentRotationY;

    // Update atmosphere shader
    if (globeScene.children.length > 1) {
        const atmosphere = globeScene.children.find(child => 
            child.material && child.material.uniforms
        );
        if (atmosphere && atmosphere.material.uniforms) {
            atmosphere.material.uniforms.viewVector.value = globeCamera.position;
        }
    }

    globeRenderer.render(globeScene, globeCamera);
}

function onWindowResize() {
    const container = document.getElementById('globeContainer');
    if (!container || !globeCamera || !globeRenderer) return;

    globeCamera.aspect = container.clientWidth / container.clientHeight;
    globeCamera.updateProjectionMatrix();
    globeRenderer.setSize(container.clientWidth, container.clientHeight);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Three.js to load
    if (typeof THREE !== 'undefined') {
        setTimeout(initGlobe, 100);
    } else {
        // Retry if Three.js hasn't loaded yet
        const checkThree = setInterval(() => {
            if (typeof THREE !== 'undefined') {
                clearInterval(checkThree);
                initGlobe();
            }
        }, 100);
    }
});

