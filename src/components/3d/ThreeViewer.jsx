import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye } from 'lucide-react';

const ThreeViewer = forwardRef(({
  modelType = 'keychain', // keychain | organizer | lamp | trophy
  selectedColor = '#00828A',
  materialType = 'PLA_SILK',
  customText = 'IDEAFORM',
  fontFamily = 'Poppins',
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

  // Sync auto rotation state with ref
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  // Expose snapshot capture and camera reset function to parent
  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/png');
      }
      return null;
    },
    resetCamera: () => {
      if (cameraRef.current && meshGroupRef.current) {
        cameraRef.current.position.set(0, 3.2, 6.8);
        cameraRef.current.lookAt(0, 0.2, 0);
        meshGroupRef.current.rotation.set(0, 0, 0);
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

    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(selectedColor),
      roughness: 0.25,
      metalness: 0.35,
      wireframe: false,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedColor === '#00828A' ? '#D4AF37' : '#00828A'),
      roughness: 0.3,
      metalness: 0.6
    });

    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      metalness: 0.95,
      roughness: 0.1
    });

    // Helper: Draw Official IdeaForm Bulb Vector Logo & Text Texture
    const createTextCanvasTexture = (text) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // 1. Background in chosen filament color with subtle relief gradient
      const grad = ctx.createLinearGradient(0, 0, 1024, 512);
      grad.addColorStop(0, selectedColor);
      grad.addColorStop(1, selectedColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Subtle chamfer border in white
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 12;
      ctx.strokeRect(20, 20, 984, 472);

      const isDefaultBrand = !text || text.toUpperCase() === 'IDEAFORM';

      if (isDefaultBrand) {
        // DRAW OFFICIAL IDEAFORM BULB ICON + BRAND TYPOGRAPHY
        ctx.save();
        ctx.translate(140, 256);
        ctx.scale(1.8, 1.8);

        // Bulb Outer
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;

        // Rays
        ctx.beginPath();
        ctx.moveTo(-25, -25); ctx.lineTo(-38, -38);
        ctx.moveTo(0, -35); ctx.lineTo(0, -50);
        ctx.moveTo(25, -25); ctx.lineTo(38, -38);
        ctx.stroke();

        // Bulb Arc
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0.75 * Math.PI, 2.25 * Math.PI, false);
        ctx.lineTo(16, 32);
        ctx.lineTo(-16, 32);
        ctx.closePath();
        ctx.stroke();

        // Filament Dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, -4, 5, 0, Math.PI * 2);
        ctx.fill();

        // Filament 'i' & 'f' Loop
        ctx.beginPath();
        ctx.moveTo(-8, 6);
        ctx.lineTo(-8, 26);
        ctx.bezierCurveTo(-8, 32, 6, 34, 10, 26);
        ctx.lineTo(10, -6);
        ctx.bezierCurveTo(10, -16, 20, -16, 24, -10);
        ctx.moveTo(-2, 12);
        ctx.lineTo(18, 12);
        ctx.stroke();
        ctx.restore();

        // Brand Text "ideaform"
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 84px ${fontFamily}, 'Space Grotesk', 'Poppins', sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 5;
        ctx.fillText('ideaform', 310, 230);

        // Subtitle "DISEÑO & IMPRESIÓN 3D"
        ctx.font = `700 28px ${fontFamily}, 'Poppins', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.letterSpacing = '0.2em';
        ctx.fillText('DISEÑO & IMPRESIÓN 3D', 315, 305);

      } else {
        // CUSTOM USER TEXT IN EMBOSSED 3D
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 82px ${fontFamily}, 'Poppins', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 6;
        ctx.fillText(text.toUpperCase(), 512, 256);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const textTexture = createTextCanvasTexture(customText);
    const textPlateMaterial = new THREE.MeshStandardMaterial({
      map: textTexture,
      roughness: 0.3,
      metalness: 0.2
    });

    // BUILD 3D PROCEDURAL MODELS
    if (modelType === 'keychain') {
      // 1. Base Chamfered Hexagon Tag
      const baseGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.22, 6);
      baseGeo.rotateX(Math.PI / 2);
      const baseMesh = new THREE.Mesh(baseGeo, mainMaterial);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Inner Tag Plate Front
      const plateGeo = new THREE.BoxGeometry(2.6, 1.35, 0.06);
      const plateMesh = new THREE.Mesh(plateGeo, textPlateMaterial);
      plateMesh.position.z = 0.13;
      group.add(plateMesh);

      // Back Plate
      const backPlate = new THREE.Mesh(plateGeo, textPlateMaterial);
      backPlate.position.z = -0.13;
      backPlate.rotation.y = Math.PI;
      group.add(backPlate);

      // Keychain Metallic Ring
      const ringGeo = new THREE.TorusGeometry(0.55, 0.07, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, steelMaterial);
      ringMesh.position.set(0, 2.05, 0);
      ringMesh.rotation.y = Math.PI / 4;
      group.add(ringMesh);

      // Hole ring connector
      const holeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.32, 16);
      holeGeo.rotateX(Math.PI / 2);
      const holeMesh = new THREE.Mesh(holeGeo, accentMaterial);
      holeMesh.position.set(0, 1.52, 0);
      group.add(holeMesh);

    } else if (modelType === 'organizer') {
      // Hexagonal Desk Station
      const mainGeo = new THREE.CylinderGeometry(1.6, 1.8, 2.0, 6);
      const mainMesh = new THREE.Mesh(mainGeo, mainMaterial);
      mainMesh.castShadow = true;
      group.add(mainMesh);

      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const slotGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.8, 16);
        const slotMesh = new THREE.Mesh(slotGeo, accentMaterial);
        slotMesh.position.set(Math.cos(angle) * 0.75, 0.8, Math.sin(angle) * 0.75);
        group.add(slotMesh);
      }

      const phoneTrayGeo = new THREE.BoxGeometry(2.2, 0.5, 0.8);
      const phoneTrayMesh = new THREE.Mesh(phoneTrayGeo, mainMaterial);
      phoneTrayMesh.position.set(0, -0.65, 1.3);
      group.add(phoneTrayMesh);

      const badgeGeo = new THREE.BoxGeometry(2.0, 0.6, 0.05);
      const badgeMesh = new THREE.Mesh(badgeGeo, textPlateMaterial);
      badgeMesh.position.set(0, -0.2, 1.55);
      badgeMesh.rotation.x = -0.2;
      group.add(badgeMesh);

    } else if (modelType === 'lamp') {
      const lampBaseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.5, 32);
      const lampBaseMesh = new THREE.Mesh(lampBaseGeo, accentMaterial);
      lampBaseMesh.position.y = -1.2;
      group.add(lampBaseMesh);

      const shadeGeo = new THREE.CylinderGeometry(1.3, 1.3, 2.4, 32, 1, true);
      const shadeMesh = new THREE.Mesh(shadeGeo, textPlateMaterial);
      shadeMesh.position.y = 0.2;
      group.add(shadeMesh);

      const bulbGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe8b3 });
      const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
      bulbMesh.position.y = 0.2;
      group.add(bulbMesh);

      const pointLight = new THREE.PointLight(0xffc56e, 2.5, 6);
      pointLight.position.y = 0.2;
      group.add(pointLight);

    } else if (modelType === 'trophy') {
      const base1Geo = new THREE.BoxGeometry(2.2, 0.4, 2.2);
      const base1Mesh = new THREE.Mesh(base1Geo, accentMaterial);
      base1Mesh.position.y = -1.3;
      group.add(base1Mesh);

      const base2Geo = new THREE.BoxGeometry(1.8, 0.3, 1.8);
      const base2Mesh = new THREE.Mesh(base2Geo, mainMaterial);
      base2Mesh.position.y = -0.95;
      group.add(base2Mesh);

      const towerGeo = new THREE.ConeGeometry(1.2, 2.6, 5);
      const towerMesh = new THREE.Mesh(towerGeo, mainMaterial);
      towerMesh.position.y = 0.45;
      towerMesh.castShadow = true;
      group.add(towerMesh);

      const awardPlateGeo = new THREE.BoxGeometry(1.4, 0.5, 0.05);
      const awardPlateMesh = new THREE.Mesh(awardPlateGeo, textPlateMaterial);
      awardPlateMesh.position.set(0, -0.95, 0.93);
      group.add(awardPlateMesh);
    }

    group.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
  }, [modelType, selectedColor, materialType, customText, fontFamily, scaleMultiplier]);

  // Initialize Three.js WebGL Scene ONCE on Mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, 6.8);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

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
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x00e5ff, 0.4);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    const gridHelper = new THREE.GridHelper(12, 24, 0x00828a, 0xe2e8f0);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    const meshGroup = new THREE.Group();
    meshGroup.position.y = -0.2;
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    buildGeometry();

    // Mouse & Touch Orbit Controls
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

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      if (isAutoRotatingRef.current && meshGroupRef.current && !isDraggingRef.current) {
        meshGroupRef.current.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };

    animate();

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
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    buildGeometry();
  }, [buildGeometry]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          cursor: 'grab',
          touchAction: 'none'
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
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
            background: isAutoRotating ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.95)',
            color: isAutoRotating ? '#ffffff' : '#0f172a',
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <RotateCw size={16} />
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'rgba(255, 255, 255, 0.9)',
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
        <span>Arrastra para rotar 360° • Zoom con rueda</span>
      </div>
    </div>
  );
});

export default ThreeViewer;
