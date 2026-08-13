import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCw, Sun, Moon, Layers, Eye } from 'lucide-react';

const ThreeViewer = forwardRef(({
  modelType = 'keychain', // keychain | organizer | lamp | trophy
  selectedColor = '#00828A',
  materialType = 'PLA_SILK',
  customText = 'IDEAFORM',
  fontFamily = 'Plus Jakarta Sans',
  scaleMultiplier = 1,
  showDimensions = true
}, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshGroupRef = useRef(null);
  const animFrameId = useRef(null);

  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const isAutoRotatingRef = useRef(true);
  const isDraggingRef = useRef(false);

  const [lightingMode, setLightingMode] = useState('studio'); // studio | dark
  const [wireframeMode, setWireframeMode] = useState(false);

  // Sync ref with state
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  // Expose snapshot capture and camera reset function to parent
  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/webp', 0.85);
      }
      return null;
    },
    resetCamera: () => {
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 3.2, 6.8);
        cameraRef.current.lookAt(0, 0.2, 0);
      }
    }
  }));

  // Rebuild / Update 3D Geometry Function
  const buildGeometry = useCallback(() => {
    if (!meshGroupRef.current) return;
    const group = meshGroupRef.current;

    // Clear existing meshes cleanly
    while (group.children.length > 0) {
      const obj = group.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
      group.remove(obj);
    }

    // Determine Material Properties based on polymer
    let roughness = 0.5;
    let metalness = 0.1;
    let transmission = 0.0;
    let opacity = 1.0;
    let transparent = false;

    if (materialType === 'PLA_SILK') {
      roughness = 0.22;
      metalness = 0.45;
    } else if (materialType === 'PLA_STANDARD') {
      roughness = 0.7;
      metalness = 0.02;
    } else if (materialType === 'PETG') {
      roughness = 0.15;
      metalness = 0.1;
      transmission = 0.45;
      transparent = true;
      opacity = 0.85;
    } else if (materialType === 'RESIN') {
      roughness = 0.1;
      metalness = 0.05;
    }

    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(selectedColor),
      roughness,
      metalness,
      transmission,
      opacity,
      transparent,
      wireframe: wireframeMode,
      clearcoat: materialType === 'PLA_SILK' || materialType === 'RESIN' ? 0.6 : 0.0,
      clearcoatRoughness: 0.1
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedColor === '#00828A' ? '#D4AF37' : '#00828A'),
      roughness: 0.3,
      metalness: 0.6,
      wireframe: wireframeMode
    });

    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.1
    });

    // Helper: Create Text Canvas Texture for Engraving
    const createTextCanvasTexture = (text) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, 512, 256);

      // Engraved Text with bevel shadow
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 52px ${fontFamily}, 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Soft shadow for 3D depth
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;

      ctx.fillText((text || 'IDEAFORM').toUpperCase(), 256, 128);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const textTexture = createTextCanvasTexture(customText);
    const textPlateMaterial = new THREE.MeshStandardMaterial({
      map: textTexture,
      roughness: 0.4,
      metalness: 0.1,
      wireframe: wireframeMode
    });

    // BUILD PROCEDURAL 3D MODELS
    if (modelType === 'keychain') {
      // 1. Base Chamfered Hexagon Tag
      const baseGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.25, 6);
      baseGeo.rotateX(Math.PI / 2);
      const baseMesh = new THREE.Mesh(baseGeo, mainMaterial);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Inner Tag Plate with text texture
      const plateGeo = new THREE.BoxGeometry(2.4, 1.2, 0.08);
      const plateMesh = new THREE.Mesh(plateGeo, textPlateMaterial);
      plateMesh.position.z = 0.15;
      group.add(plateMesh);

      // Back Plate
      const backPlate = new THREE.Mesh(plateGeo, textPlateMaterial);
      backPlate.position.z = -0.15;
      backPlate.rotation.y = Math.PI;
      group.add(backPlate);

      // Keychain Metallic Ring
      const ringGeo = new THREE.TorusGeometry(0.5, 0.06, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, steelMaterial);
      ringMesh.position.set(0, 1.9, 0);
      ringMesh.rotation.y = Math.PI / 4;
      group.add(ringMesh);

      // Hole ring
      const holeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 16);
      holeGeo.rotateX(Math.PI / 2);
      const holeMesh = new THREE.Mesh(holeGeo, accentMaterial);
      holeMesh.position.set(0, 1.45, 0);
      group.add(holeMesh);

    } else if (modelType === 'organizer') {
      // Hexagonal Desk Station
      const mainGeo = new THREE.CylinderGeometry(1.6, 1.8, 2.0, 6);
      const mainMesh = new THREE.Mesh(mainGeo, mainMaterial);
      mainMesh.castShadow = true;
      group.add(mainMesh);

      // Pen Slots (Top cylinders)
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const slotGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.8, 16);
        const slotMesh = new THREE.Mesh(slotGeo, accentMaterial);
        slotMesh.position.set(Math.cos(angle) * 0.75, 0.8, Math.sin(angle) * 0.75);
        group.add(slotMesh);
      }

      // Phone Dock Plate Front
      const phoneTrayGeo = new THREE.BoxGeometry(2.2, 0.5, 0.8);
      const phoneTrayMesh = new THREE.Mesh(phoneTrayGeo, mainMaterial);
      phoneTrayMesh.position.set(0, -0.65, 1.3);
      group.add(phoneTrayMesh);

      // Front Engraved Badge
      const badgeGeo = new THREE.BoxGeometry(2.0, 0.6, 0.05);
      const badgeMesh = new THREE.Mesh(badgeGeo, textPlateMaterial);
      badgeMesh.position.set(0, -0.2, 1.55);
      badgeMesh.rotation.x = -0.2;
      group.add(badgeMesh);

    } else if (modelType === 'lamp') {
      // Litofanía DecoGlow
      const lampBaseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.5, 32);
      const lampBaseMesh = new THREE.Mesh(lampBaseGeo, accentMaterial);
      lampBaseMesh.position.y = -1.2;
      group.add(lampBaseMesh);

      // Lamp Shade (Lithophane cylinder with text)
      const shadeGeo = new THREE.CylinderGeometry(1.3, 1.3, 2.4, 32, 1, true);
      const shadeMesh = new THREE.Mesh(shadeGeo, textPlateMaterial);
      shadeMesh.position.y = 0.2;
      group.add(shadeMesh);

      // Internal Bulb Glow
      const bulbGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe8b3 });
      const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
      bulbMesh.position.y = 0.2;
      group.add(bulbMesh);

      // Point Light
      const pointLight = new THREE.PointLight(0xffc56e, 2.5, 6);
      pointLight.position.y = 0.2;
      group.add(pointLight);

    } else if (modelType === 'trophy') {
      // Trofeo Prisma Award
      const base1Geo = new THREE.BoxGeometry(2.2, 0.4, 2.2);
      const base1Mesh = new THREE.Mesh(base1Geo, accentMaterial);
      base1Mesh.position.y = -1.3;
      group.add(base1Mesh);

      const base2Geo = new THREE.BoxGeometry(1.8, 0.3, 1.8);
      const base2Mesh = new THREE.Mesh(base2Geo, mainMaterial);
      base2Mesh.position.y = -0.95;
      group.add(base2Mesh);

      // Obelisk / Diamond Tower
      const towerGeo = new THREE.ConeGeometry(1.2, 2.6, 5);
      const towerMesh = new THREE.Mesh(towerGeo, mainMaterial);
      towerMesh.position.y = 0.45;
      towerMesh.castShadow = true;
      group.add(towerMesh);

      // Award Front Plate
      const awardPlateGeo = new THREE.BoxGeometry(1.4, 0.5, 0.05);
      const awardPlateMesh = new THREE.Mesh(awardPlateGeo, textPlateMaterial);
      awardPlateMesh.position.set(0, -0.95, 0.93);
      group.add(awardPlateMesh);
    }

    group.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
  }, [modelType, selectedColor, materialType, customText, fontFamily, scaleMultiplier, wireframeMode]);

  // 1. Initialize Three.js WebGL Scene ONCE on Mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(lightingMode === 'dark' ? 0x090e17 : 0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, 6.8);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x00e5ff, 0.6);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(12, 24, 0x00828a, 0xe2e8f0);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // 3D Model Group
    const meshGroup = new THREE.Group();
    meshGroup.position.y = -0.2;
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Initial build of geometry
    buildGeometry();

    // Mouse & Touch Controls
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current || !meshGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      meshGroupRef.current.rotation.y += deltaX * 0.008;
      meshGroupRef.current.rotation.x += deltaY * 0.008;
      meshGroupRef.current.rotation.x = Math.max(-0.8, Math.min(0.8, meshGroupRef.current.rotation.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomSpeed = 0.004;
      cameraRef.current.position.z = Math.max(3.5, Math.min(11, cameraRef.current.position.z + e.deltaY * zoomSpeed));
    };

    let touchStartDist = 0;
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDraggingRef.current && meshGroupRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        meshGroupRef.current.rotation.y += deltaX * 0.008;
        meshGroupRef.current.rotation.x += deltaY * 0.008;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && cameraRef.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchStartDist - dist;
        cameraRef.current.position.z = Math.max(3.5, Math.min(11, cameraRef.current.position.z + diff * 0.01));
        touchStartDist = dist;
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('touchstart', onTouchStart);
    domElement.addEventListener('touchmove', onTouchMove);
    domElement.addEventListener('touchend', onTouchEnd);

    // Continuous Animation Loop
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      if (isAutoRotatingRef.current && meshGroupRef.current && !isDraggingRef.current) {
        meshGroupRef.current.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
      domElement.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, []); // Run once on mount

  // 2. Update background color when lightingMode toggles (without resetting canvas or scene!)
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(lightingMode === 'dark' ? 0x090e17 : 0xf8fafc);
    }
  }, [lightingMode]);

  // 3. Rebuild geometry whenever model properties change
  useEffect(() => {
    buildGeometry();
  }, [buildGeometry]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px' }}>
      {/* 3D Canvas Mounting Node */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '440px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          cursor: 'grab',
          touchAction: 'none'
        }}
      />

      {/* Dimensions Overlay */}
      {showDimensions && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Layers size={14} color="#00e5ff" />
          <span>
            {modelType === 'keychain' && '65 x 24 x 6 mm • Capa 0.2mm'}
            {modelType === 'organizer' && '140 x 120 x 85 mm • Infill 20%'}
            {modelType === 'lamp' && '110 x 110 x 135 mm • Translúcido'}
            {modelType === 'trophy' && '80 x 80 x 190 mm • Bicapa Seda'}
          </span>
        </div>
      )}

      {/* Floating Viewport Controls */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 10
        }}
      >
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? 'Pausar Rotación 360°' : 'Activar Rotación 360°'}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: isAutoRotating ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.9)',
            color: isAutoRotating ? '#ffffff' : '#0f172a',
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}
        >
          <RotateCw size={16} />
        </button>

        <button
          onClick={() => setLightingMode(lightingMode === 'studio' ? 'dark' : 'studio')}
          title="Cambiar Entorno (Claro / Oscuro)"
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#0f172a',
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}
        >
          {lightingMode === 'studio' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button
          onClick={() => setWireframeMode(!wireframeMode)}
          title="Ver Malla / Capas de Impresión 3D"
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: wireframeMode ? '#00e5ff' : 'rgba(255, 255, 255, 0.9)',
            color: '#0f172a',
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}
        >
          <Layers size={16} />
        </button>
      </div>

      {/* Rotation / Interaction Hint */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(6px)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.72rem',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          pointerEvents: 'none',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Eye size={12} color="var(--color-primary)" />
        <span>Arrastra para rotar 360° • Rueda para zoom</span>
      </div>
    </div>
  );
});

export default ThreeViewer;
