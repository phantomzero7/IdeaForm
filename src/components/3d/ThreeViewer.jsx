import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RotateCw, Sparkles, Layers } from 'lucide-react';

const ThreeViewer = forwardRef(({
  modelType = 'keychain', // keychain | trophy | sphere | car | cup | planter | custom_file
  custom3DFileUrl = null,
  custom3DFileType = null,
  selectedColor = '#176B87',
  baseColor = null,
  accentColor = '#D4AF37',
  textColor = '#FFFFFF',
  reliefColor = null,
  materialType = 'PLA_SILK',
  customText = 'IDEAFORM',
  fontFamily = 'Space Grotesk',
  logoImage = null,
  noEngraving = false,
  scaleMultiplier = 1,
  showDimensions = true
}, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshGroupRef = useRef(null);
  const animFrameId = useRef(null);

  // References to keep textures and materials for instant, fluid color updates without rebuilding
  const materialsRef = useRef({
    mainMat: null,
    accentMat: null,
    steelMat: null,
    canvasTexture: null,
    canvasElem: null,
    canvasCtx: null
  });

  const activeBaseColor = baseColor || selectedColor || '#176B87';
  const activeAccentColor = accentColor || '#D4AF37';
  const activeTextColor = reliefColor || textColor || '#FFFFFF';

  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const isAutoRotatingRef = useRef(true);
  const isDraggingRef = useRef(false);
  const [loading3D, setLoading3D] = useState(false);

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

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
        cameraRef.current.position.set(0, 3.5, 5.0);
        cameraRef.current.lookAt(0, 0, 0);
        meshGroupRef.current.rotation.set(0.35, -0.3, 0);
      }
    }
  }));

  // Function to draw text/logo texture onto the canvas
  const updateCanvasTexture = useCallback(() => {
    let canvas = materialsRef.current.canvasElem;
    let ctx = materialsRef.current.canvasCtx;

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      ctx = canvas.getContext('2d');
      materialsRef.current.canvasElem = canvas;
      materialsRef.current.canvasCtx = ctx;
    }

    // 1. Fill base background in activeBaseColor
    ctx.fillStyle = activeBaseColor;
    ctx.fillRect(0, 0, 2048, 1024);

    // 2. Multi-layer inner chamfer / accent border
    ctx.strokeStyle = activeAccentColor;
    ctx.lineWidth = 28;
    ctx.lineJoin = 'round';
    ctx.strokeRect(40, 40, 1968, 944);

    // Subtle inner accent line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 8;
    ctx.strokeRect(80, 80, 1888, 864);

    if (!noEngraving) {
      ctx.save();
      
      // Embossed 3D Drop Shadow Effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 8;

      if (logoImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoImage;
        img.onload = () => {
          ctx.drawImage(img, 624, 212, 800, 600);
          if (materialsRef.current.canvasTexture) {
            materialsRef.current.canvasTexture.needsUpdate = true;
          }
        };
      } else {
        const isDefault = !customText || customText.trim().toUpperCase() === 'IDEAFORM';

        if (isDefault) {
          // Draw official vector bulb + IdeaForm text
          ctx.strokeStyle = activeAccentColor;
          ctx.lineWidth = 26;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Bulb dome
          ctx.beginPath();
          ctx.arc(580, 512, 140, 0, Math.PI * 2);
          ctx.stroke();

          // Dot
          ctx.fillStyle = activeAccentColor;
          ctx.beginPath();
          ctx.arc(530, 450, 22, 0, Math.PI * 2);
          ctx.fill();

          // Typography
          ctx.font = `bold 200px 'Space Grotesk', sans-serif`;
          ctx.fillStyle = activeTextColor;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('Idea', 840, 520);

          ctx.fillStyle = activeAccentColor;
          ctx.fillText('Form', 1300, 520);
        } else {
          // Custom embossed text - dynamically scaled & centered perfectly
          const displayStr = customText.toUpperCase();
          const charLen = Math.max(displayStr.length, 1);
          const fontSize = Math.min(220, Math.floor(1700 / (charLen * 0.65)));

          let cleanFont = fontFamily;
          if (cleanFont.includes('Poppins')) cleanFont = 'Poppins, sans-serif';
          else if (cleanFont.includes('Tech')) cleanFont = `'Space Grotesk', monospace`;
          else if (cleanFont.includes('Serif')) cleanFont = `'Playfair Display', serif`;
          else if (cleanFont.includes('Cursiva')) cleanFont = `'Dancing Script', cursive`;
          else cleanFont = 'sans-serif';

          ctx.font = `800 ${fontSize}px ${cleanFont}`;
          ctx.fillStyle = activeTextColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(displayStr, 1024, 512);
        }
      }
      ctx.restore();
    }

    if (!materialsRef.current.canvasTexture) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      materialsRef.current.canvasTexture = tex;
    } else {
      materialsRef.current.canvasTexture.needsUpdate = true;
    }

    return materialsRef.current.canvasTexture;
  }, [activeBaseColor, activeAccentColor, activeTextColor, customText, fontFamily, logoImage, noEngraving]);

  // Build / Rebuild Geometry when modelType changes, preserving current rotation!
  const buildGeometry = useCallback(() => {
    if (!meshGroupRef.current) return;
    const group = meshGroupRef.current;

    // Preserve existing rotation so it doesn't snap or restart!
    const currentRotX = group.rotation.x;
    const currentRotY = group.rotation.y;
    const currentRotZ = group.rotation.z;

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

    // Material 1: Body / Base
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(activeBaseColor),
      roughness: 0.22,
      metalness: 0.35,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1
    });
    materialsRef.current.mainMat = mainMaterial;

    // Material 2: Accent (Trim, Borders, Stand)
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeAccentColor),
      roughness: 0.25,
      metalness: 0.7
    });
    materialsRef.current.accentMat = accentMat;

    // Material 3: Metallic Steel / Ring
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      metalness: 0.95,
      roughness: 0.1
    });
    materialsRef.current.steelMat = steelMaterial;

    // --- CASE A: CUSTOM UPLOADED 3D FILE ---
    if (custom3DFileUrl) {
      setLoading3D(true);
      const isSTL = custom3DFileType === 'stl' || custom3DFileUrl.toLowerCase().includes('.stl');

      if (isSTL) {
        const loader = new STLLoader();
        loader.load(
          custom3DFileUrl,
          (geometry) => {
            geometry.computeVertexNormals();
            geometry.center();
            const mesh = new THREE.Mesh(geometry, mainMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const box = new THREE.Box3().setFromObject(mesh);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = 4.0 / maxDim;
            mesh.scale.set(scale, scale, scale);

            group.add(mesh);
            setLoading3D(false);
          },
          undefined,
          () => setLoading3D(false)
        );
      } else {
        const loader = new GLTFLoader();
        loader.load(
          custom3DFileUrl,
          (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = mainMaterial;
              }
            });

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = 4.0 / maxDim;
            model.scale.set(scale, scale, scale);

            group.add(model);
            setLoading3D(false);
          },
          undefined,
          () => setLoading3D(false)
        );
      }
      return;
    }

    // --- CASE B: PARAMETRIC 3D MODELS ---
    const textTexture = updateCanvasTexture();

    // 1. KEYCHAIN / MOCHILA TAG (Elevated 3D View with Top Face Text)
    if (modelType === 'keychain') {
      const plateGeo = new THREE.BoxGeometry(4.6, 0.45, 2.3);
      
      const plateMaterials = [
        mainMaterial, // +X right
        mainMaterial, // -X left
        new THREE.MeshPhysicalMaterial({ map: textTexture, roughness: 0.2, metalness: 0.2 }), // +Y TOP SURFACE
        mainMaterial, // -Y bottom
        mainMaterial, // +Z front
        mainMaterial  // -Z back
      ];

      const mainMesh = new THREE.Mesh(plateGeo, plateMaterials);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      group.add(mainMesh);

      // Accent border rim (Zone 2)
      const rimGeo = new THREE.BoxGeometry(4.75, 0.15, 2.45);
      const rimMesh = new THREE.Mesh(rimGeo, accentMat);
      rimMesh.position.y = 0.22;
      group.add(rimMesh);

      // Keychain Ring (Steel)
      const ringGeo = new THREE.TorusGeometry(0.5, 0.08, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, steelMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(-2.8, 0, 0);
      group.add(ringMesh);
    }

    // 2. TROPHY
    else if (modelType === 'trophy') {
      const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.7, 32);
      const baseMesh = new THREE.Mesh(baseGeo, accentMat);
      baseMesh.position.y = -1.2;
      group.add(baseMesh);

      const columnGeo = new THREE.BoxGeometry(2.4, 3.2, 0.45);
      const columnMat = [
        mainMaterial,
        mainMaterial,
        mainMaterial,
        mainMaterial,
        new THREE.MeshPhysicalMaterial({ map: textTexture, roughness: 0.15, metalness: 0.2 }),
        mainMaterial
      ];
      const mainMesh = new THREE.Mesh(columnGeo, columnMat);
      mainMesh.position.y = 0.8;
      mainMesh.castShadow = true;
      group.add(mainMesh);

      const peakGeo = new THREE.ConeGeometry(0.8, 0.9, 4);
      const peakMesh = new THREE.Mesh(peakGeo, accentMat);
      peakMesh.position.y = 2.8;
      peakMesh.rotation.y = Math.PI / 4;
      group.add(peakMesh);
    }

    // 3. SPHERE / ESFERA
    else if (modelType === 'sphere') {
      const sphereGeo = new THREE.SphereGeometry(1.8, 48, 48);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(activeBaseColor),
        roughness: 0.2,
        metalness: 0.35,
        clearcoat: 0.8
      });
      const mainMesh = new THREE.Mesh(sphereGeo, sphereMat);
      mainMesh.castShadow = true;
      group.add(mainMesh);

      const bandGeo = new THREE.TorusGeometry(1.82, 0.12, 16, 48);
      const bandMesh = new THREE.Mesh(bandGeo, accentMat);
      bandMesh.rotation.x = Math.PI / 2;
      group.add(bandMesh);

      const capGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.35, 24);
      const capMesh = new THREE.Mesh(capGeo, steelMaterial);
      capMesh.position.y = 1.95;
      group.add(capMesh);

      const topRingGeo = new THREE.TorusGeometry(0.3, 0.06, 16, 24);
      const topRingMesh = new THREE.Mesh(topRingGeo, steelMaterial);
      topRingMesh.position.y = 2.3;
      group.add(topRingMesh);
    }

    // 4. CAR
    else if (modelType === 'car') {
      const bodyGeo = new THREE.BoxGeometry(4.2, 1.1, 2.0);
      const bodyMesh = new THREE.Mesh(bodyGeo, mainMaterial);
      bodyMesh.position.y = 0.2;
      group.add(bodyMesh);

      const cabinGeo = new THREE.BoxGeometry(2.4, 0.9, 1.7);
      const cabinMesh = new THREE.Mesh(cabinGeo, accentMat);
      cabinMesh.position.set(-0.2, 1.0, 0);
      group.add(cabinMesh);

      const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 24);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });

      const wheelPositions = [
        [1.3, -0.3, 1.05],
        [1.3, -0.3, -1.05],
        [-1.3, -0.3, 1.05],
        [-1.3, -0.3, -1.05]
      ];

      wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        group.add(wheel);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.38, 16), steelMaterial);
        hub.rotation.x = Math.PI / 2;
        hub.position.set(pos[0], pos[1], pos[2]);
        group.add(hub);
      });
    }

    // 5. CUP / CYLINDER
    else if (modelType === 'cup') {
      const cupGeo = new THREE.CylinderGeometry(1.6, 1.4, 3.2, 36, 1, true);
      const cupMesh = new THREE.Mesh(cupGeo, mainMaterial);
      group.add(cupMesh);

      const botGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.2, 36);
      const botMesh = new THREE.Mesh(botGeo, mainMaterial);
      botMesh.position.y = -1.5;
      group.add(botMesh);

      const topRimGeo = new THREE.TorusGeometry(1.6, 0.08, 16, 36);
      const topRimMesh = new THREE.Mesh(topRimGeo, accentMat);
      topRimMesh.rotation.x = Math.PI / 2;
      topRimMesh.position.y = 1.6;
      group.add(topRimMesh);

      const handleGeo = new THREE.TorusGeometry(0.9, 0.16, 16, 32, Math.PI);
      const handleMesh = new THREE.Mesh(handleGeo, accentMat);
      handleMesh.rotation.z = -Math.PI / 2;
      handleMesh.position.set(1.7, 0, 0);
      group.add(handleMesh);
    }

    // 6. PLANTER
    else {
      const planterGeo = new THREE.DodecahedronGeometry(1.8, 0);
      const planterMesh = new THREE.Mesh(planterGeo, mainMaterial);
      planterMesh.castShadow = true;
      group.add(planterMesh);

      const trayGeo = new THREE.TorusGeometry(1.85, 0.1, 16, 6);
      const trayMesh = new THREE.Mesh(trayGeo, accentMat);
      trayMesh.rotation.x = Math.PI / 2;
      group.add(trayMesh);
    }

    // Restore rotation
    group.rotation.set(currentRotX, currentRotY, currentRotZ);
  }, [modelType, custom3DFileUrl, custom3DFileType, activeBaseColor, activeAccentColor, updateCanvasTexture]);

  // Instant update of material colors and texture without destroying geometry (100% fluid)
  useEffect(() => {
    if (materialsRef.current.mainMat) {
      materialsRef.current.mainMat.color.set(activeBaseColor);
    }
    if (materialsRef.current.accentMat) {
      materialsRef.current.accentMat.color.set(activeAccentColor);
    }
    updateCanvasTexture();
  }, [activeBaseColor, activeAccentColor, activeTextColor, customText, fontFamily, logoImage, updateCanvasTexture]);

  // Three.js Scene Setup Loop
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Isometric / elevated 3D camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 5.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    // Warm Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(6, 10, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5c4d4, 1.0);
    dirLight2.position.set(-6, -2, -6);
    scene.add(dirLight2);

    const group = new THREE.Group();
    // Default pleasant elevated angle
    group.rotation.set(0.45, -0.35, 0);
    meshGroupRef.current = group;
    scene.add(group);

    buildGeometry();

    let mouseX = 0;
    let mouseY = 0;

    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current || !meshGroupRef.current) return;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      meshGroupRef.current.rotation.y += deltaX * 0.01;
      meshGroupRef.current.rotation.x += deltaY * 0.01;

      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      if (isAutoRotatingRef.current && meshGroupRef.current && !isDraggingRef.current) {
        meshGroupRef.current.rotation.y += 0.007;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [buildGeometry]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'grab',
        userSelect: 'none'
      }}
    >
      {loading3D && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#176B87' }}>Cargando modelo 3D...</span>
        </div>
      )}

      {/* 3D Auto-Spin Control */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.4rem', zIndex: 10 }}>
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          style={{
            background: isAutoRotating ? 'rgba(23, 107, 135, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            color: isAutoRotating ? '#ffffff' : '#1e293b',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 'var(--radius-full)',
            padding: '0.4rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <RotateCw size={13} />
          <span>{isAutoRotating ? 'Giro 360°' : 'Pausar Giro'}</span>
        </button>
      </div>

      {/* Multi-Zone Color Layer Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          background: 'rgba(255, 255, 255, 0.94)',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: '#0F172A',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backdropFilter: 'blur(6px)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: activeBaseColor, border: '1px solid rgba(0,0,0,0.2)' }} />
          <span>Base</span>
        </div>
        <span style={{ opacity: 0.3 }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: activeAccentColor, border: '1px solid rgba(0,0,0,0.2)' }} />
          <span>Acento</span>
        </div>
        <span style={{ opacity: 0.3 }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: activeTextColor, border: '1px solid rgba(0,0,0,0.2)' }} />
          <span>Relieve 3D</span>
        </div>
      </div>
    </div>
  );
});

export default ThreeViewer;
