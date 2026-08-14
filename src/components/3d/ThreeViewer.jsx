import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RotateCw, Eye, Sparkles } from 'lucide-react';

const ThreeViewer = forwardRef(({
  modelType = 'keychain', // keychain | trophy | sphere | car | cup | planter | custom_file
  custom3DFileUrl = null, // string ObjectURL or data URL for .GLB / .GLTF / .STL
  custom3DFileType = null, // 'glb' | 'gltf' | 'stl' | null
  selectedColor = '#176B87', // Base / Body color
  baseColor = null,
  accentColor = '#D4AF37', // Secondary / Accent color (oro, plata, etc.)
  textColor = '#FFFFFF', // Relief / Text color
  reliefColor = null,
  materialType = 'PLA_SILK',
  customText = 'IDEAFORM',
  fontFamily = 'Space Grotesk',
  logoImage = null, // string URL / DataURL or null
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
        cameraRef.current.position.set(0, 3.2, 6.8);
        cameraRef.current.lookAt(0, 0.2, 0);
        meshGroupRef.current.rotation.set(0, 0, 0);
      }
    }
  }));

  const buildGeometry = useCallback(() => {
    if (!meshGroupRef.current) return;
    const group = meshGroupRef.current;

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

    // Material 2: Accent (Trim, Borders, Stand)
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeAccentColor),
      roughness: 0.25,
      metalness: 0.7
    });

    // Material 3: Metallic Steel / Ring
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      metalness: 0.95,
      roughness: 0.1
    });

    // --- CASE A: CUSTOM UPLOADED 3D FILE (.GLB / .GLTF / .STL) ---
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
          (error) => {
            console.error('Error loading STL:', error);
            setLoading3D(false);
          }
        );
      } else {
        // GLTF / GLB Loader
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
          (error) => {
            console.error('Error loading GLTF/GLB:', error);
            setLoading3D(false);
          }
        );
      }
      return;
    }

    // --- CASE B: BUILT-IN PARAMETRIC 3D GEOMETRIES ---
    const createTextCanvasTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Base background
      ctx.fillStyle = activeBaseColor;
      ctx.fillRect(0, 0, 1024, 512);

      // Accent border
      ctx.strokeStyle = activeAccentColor;
      ctx.lineWidth = 16;
      ctx.strokeRect(20, 20, 984, 472);

      if (noEngraving) {
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
      }

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 4;

      if (logoImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoImage;
        img.onload = () => {
          ctx.drawImage(img, 312, 106, 400, 300);
          const dynamicTexture = new THREE.CanvasTexture(canvas);
          dynamicTexture.needsUpdate = true;
          if (mainMesh) {
            if (Array.isArray(mainMesh.material)) {
              mainMesh.material[4].map = dynamicTexture;
              mainMesh.material[4].needsUpdate = true;
            } else {
              mainMesh.material.map = dynamicTexture;
              mainMesh.material.needsUpdate = true;
            }
          }
        };
      } else {
        const isDefault = !customText || customText.trim().toUpperCase() === 'IDEAFORM';

        if (isDefault) {
          ctx.strokeStyle = activeAccentColor;
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.arc(280, 256, 75, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = activeAccentColor;
          ctx.beginPath();
          ctx.arc(250, 220, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = `bold 105px 'Space Grotesk', sans-serif`;
          ctx.fillStyle = activeTextColor;
          ctx.fillText('Idea', 420, 290);

          ctx.fillStyle = activeAccentColor;
          ctx.fillText('Form', 660, 290);
        } else {
          const displayStr = customText.toUpperCase();
          const fontSize = Math.min(110, Math.floor(820 / Math.max(displayStr.length, 1)));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = activeTextColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(displayStr, 512, 256);
        }
      }

      ctx.restore();
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    let mainMesh = null;

    // 1. KEYCHAIN
    if (modelType === 'keychain') {
      const plateGeo = new THREE.BoxGeometry(4.2, 0.4, 2.2);
      const textTexture = createTextCanvasTexture();

      const plateMaterials = [
        mainMaterial,
        mainMaterial,
        mainMaterial,
        mainMaterial,
        new THREE.MeshPhysicalMaterial({ map: textTexture, roughness: 0.22, metalness: 0.25 }),
        mainMaterial
      ];

      mainMesh = new THREE.Mesh(plateGeo, plateMaterials);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      group.add(mainMesh);

      const rimGeo = new THREE.BoxGeometry(4.35, 0.15, 2.35);
      const rimMesh = new THREE.Mesh(rimGeo, accentMat);
      rimMesh.position.y = 0.18;
      group.add(rimMesh);

      const ringGeo = new THREE.TorusGeometry(0.45, 0.08, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, steelMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(-2.5, 0, 0);
      group.add(ringMesh);
    }

    // 2. TROPHY
    else if (modelType === 'trophy') {
      const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.7, 32);
      const baseMesh = new THREE.Mesh(baseGeo, accentMat);
      baseMesh.position.y = -1.2;
      group.add(baseMesh);

      const columnGeo = new THREE.BoxGeometry(2.4, 3.2, 0.45);
      const textTexture = createTextCanvasTexture();
      const columnMat = [
        mainMaterial,
        mainMaterial,
        mainMaterial,
        mainMaterial,
        new THREE.MeshPhysicalMaterial({ map: textTexture, roughness: 0.15, metalness: 0.2 }),
        mainMaterial
      ];
      mainMesh = new THREE.Mesh(columnGeo, columnMat);
      mainMesh.position.y = 0.8;
      mainMesh.castShadow = true;
      group.add(mainMesh);

      const peakGeo = new THREE.ConeGeometry(0.8, 0.9, 4);
      const peakMesh = new THREE.Mesh(peakGeo, accentMat);
      peakMesh.position.y = 2.8;
      peakMesh.rotation.y = Math.PI / 4;
      group.add(peakMesh);
    }

    // 3. SPHERE
    else if (modelType === 'sphere') {
      const sphereGeo = new THREE.SphereGeometry(1.8, 48, 48);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(activeBaseColor),
        roughness: 0.2,
        metalness: 0.35,
        clearcoat: 0.8
      });
      mainMesh = new THREE.Mesh(sphereGeo, sphereMat);
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

    // 5. CUP
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

  }, [modelType, custom3DFileUrl, custom3DFileType, activeBaseColor, activeAccentColor, activeTextColor, customText, logoImage, noEngraving]);

  // Three.js Setup Loop
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 6.8);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5c4d4, 0.9);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    const group = new THREE.Group();
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
        meshGroupRef.current.rotation.y += 0.008;
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

      {/* 3D Controls Overlays */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.4rem', zIndex: 10 }}>
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          style={{
            background: isAutoRotating ? 'rgba(23, 107, 135, 0.85)' : 'rgba(255, 255, 255, 0.85)',
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
          <span>{isAutoRotating ? 'Giro Activo' : 'Pausar Giro'}</span>
        </button>
      </div>

      {/* Multi-Zone Colors Indicator Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: '#0F172A',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backdropFilter: 'blur(4px)',
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
