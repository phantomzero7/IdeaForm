import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { RotateCw, Sparkles, Layers } from 'lucide-react';
import IdeaFormLogo from '../common/IdeaFormLogo';

const ThreeViewer = forwardRef(({
  modelType = 'keychain', // keychain | trophy | sphere | car | cup | planter | custom_file
  custom3DFileUrl = null,
  custom3DFileType = null,
  selectedColor = '#176B87',
  baseColor = null,
  accentColor = '#D4AF37',
  textColor = null,
  reliefColor = null,
  materialType = 'PLA_SILK',
  customText = 'IDEAFORM',
  fontFamily = 'Space Grotesk',
  logoImage = null,
  noEngraving = false,
  scaleMultiplier = 1,
  showDimensions = true,
  showFloatingBadge = false
}, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshGroupRef = useRef(null);
  const animFrameId = useRef(null);

  // References for live material and texture updates without destroying the WebGL context or scene
  const materialsRef = useRef({
    mainMat: null,
    accentMat: null,
    steelMat: null,
    reliefMat: null,
    canvasTexture: null,
    canvasElem: null,
    canvasCtx: null
  });

  const resolveHex = (val, fallback = '#176B87') => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.hex) return String(val.hex);
    return fallback;
  };

  const activeBaseColor = resolveHex(baseColor || selectedColor, '#176B87');
  const activeAccentColor = resolveHex(accentColor, '#D4AF37');
  const activeTextColor = resolveHex(reliefColor || textColor, '#FFFFFF');

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
        cameraRef.current.position.set(0, 0.4, 7.2);
        cameraRef.current.lookAt(0, 0, 0);
        meshGroupRef.current.rotation.set(0.45, -0.35, 0);
      }
    }
  }));

  // Function to draw high-res 2048x1024 text/logo texture with vivid 3D embossed relief
  const drawCanvas = useCallback(() => {
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

    // 2. Multi-layer accent border (Zone 2)
    ctx.strokeStyle = activeAccentColor;
    ctx.lineWidth = 36;
    ctx.lineJoin = 'round';
    ctx.strokeRect(40, 40, 1968, 944);

    // Subtle inner accent line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 10;
    ctx.strokeRect(84, 84, 1880, 856);

    if (!noEngraving) {
      if (logoImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoImage;
        img.onload = () => {
          ctx.drawImage(img, 524, 162, 1000, 700);
          if (materialsRef.current.canvasTexture) {
            materialsRef.current.canvasTexture.needsUpdate = true;
          }
        };
      } else {
        const isBrandLogo = !customText || customText.trim().toUpperCase() === 'IDEAFORM';

        if (isBrandLogo) {
          // --- 100% IDENTICAL OFFICIAL IDEAFORM VECTOR LOGO ON 3D RELIEF ---
          const isLightBase = ['#ffffff', '#faeeeb', '#f1f5f9', '#f8fafc', '#e2e8f0', '#fdf2f0'].includes(String(activeBaseColor || '').toLowerCase());
          const bulbColor = isLightBase ? '#176B87' : '#00E5FF';
          const ideaColor = isLightBase ? '#0F172A' : '#FFFFFF';
          const formColor = isLightBase ? '#176B87' : '#00E5FF';
          const taglineColor = isLightBase ? '#526071' : '#cbd5e1';

          // Exact Path2D vector definitions taken directly from official IdeaFormLogo.jsx (viewBox 0 0 100 120)
          const domePath = new Path2D("M20 54C14 38 26 22 46 20C66 18 82 32 82 52C82 62 76 70 70 76C67 79 66 83 66 88");
          const ifLoopPath = new Path2D("M20 54C20 62 26 70 34 76V96C34 105 44 107 50 101C56 95 56 62 56 50C56 38 68 36 74 42");

          const drawExactBulbLogo = (ox, oy, s, strokeCol) => {
            ctx.save();
            ctx.translate(ox, oy);
            ctx.scale(s, s);

            ctx.strokeStyle = strokeCol;
            ctx.fillStyle = strokeCol;
            ctx.lineWidth = 6.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // 3 Radiating Light Rays at Top
            ctx.beginPath();
            ctx.moveTo(22, 20); ctx.lineTo(12, 10);
            ctx.moveTo(50, 14); ctx.lineTo(50, 2);
            ctx.moveTo(78, 20); ctx.lineTo(88, 10);
            ctx.stroke();

            // Outer Light Bulb Dome Contour
            ctx.stroke(domePath);

            // Filament 'i' Dot
            ctx.beginPath();
            ctx.arc(36, 44, 4.5, 0, Math.PI * 2);
            ctx.fill();

            // 'i' stem and 'f' loop
            ctx.stroke(ifLoopPath);

            // Crossbar for 'f'
            ctx.beginPath();
            ctx.moveTo(46, 64); ctx.lineTo(68, 64);
            ctx.stroke();

            ctx.restore();
          };

          const scale = 5.2;
          const bulbX = 220;
          const bulbY = (1024 - 120 * scale) / 2 + 10;

          // 1. 3D Depth Extrusion Shadow (+8px offset)
          drawExactBulbLogo(bulbX + 8, bulbY + 8, scale, 'rgba(0, 0, 0, 0.65)');

          // 2. Exact Crisp Foreground Isotype
          drawExactBulbLogo(bulbX, bulbY, scale, bulbColor);

          // 3. Brand Typography: "IdeaForm"
          const textStartX = bulbX + 100 * scale + 60; // 220 + 520 + 60 = 800

          ctx.font = `800 230px 'Space Grotesk', 'Plus Jakarta Sans', sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';

          const ideaWidth = ctx.measureText('Idea').width;

          // Typography Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillText('Idea', textStartX + 6, 520 + 6);
          ctx.fillText('Form', textStartX + ideaWidth + 6, 520 + 6);

          // Typography Fill: "Idea" in Charcoal, "Form" in Brand Teal
          ctx.fillStyle = ideaColor;
          ctx.fillText('Idea', textStartX, 520);

          ctx.fillStyle = formColor;
          ctx.fillText('Form', textStartX + ideaWidth, 520);

          // 4. Tagline: "Ideas que toman forma."
          ctx.font = `500 100px 'Plus Jakarta Sans', 'Inter', sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';

          // Tagline Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillText('Ideas que toman forma.', textStartX + 4, 650 + 4);

          // Tagline Fill
          ctx.fillStyle = taglineColor;
          ctx.fillText('Ideas que toman forma.', textStartX, 650);
        } else {
          // --- CUSTOMER CUSTOM ENGRAVING IN FULL-SIZE PROMINENT RELIEF ---
          const displayStr = customText.trim().toUpperCase();
          const charLen = Math.max(displayStr.length, 1);
          const fontSize = Math.min(290, Math.max(100, Math.floor(1850 / (charLen * 0.62))));

          let cleanFont = 'Poppins, sans-serif';
          if (fontFamily) {
            if (fontFamily.includes('Space') || fontFamily.includes('Tech')) cleanFont = `'Space Grotesk', monospace`;
            else if (fontFamily.includes('Playfair') || fontFamily.includes('Serif')) cleanFont = `'Playfair Display', serif`;
            else if (fontFamily.includes('Dancing') || fontFamily.includes('Cursiva')) cleanFont = `'Dancing Script', cursive`;
            else if (fontFamily.includes('Poppins')) cleanFont = `'Poppins', sans-serif`;
            else cleanFont = `'${fontFamily}', sans-serif`;
          }

          ctx.font = `900 ${fontSize}px ${cleanFont}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // 4 Deep 3D Extrusion Shadow Layers (Physical 3D depth)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillText(displayStr, 1024 + 8, 512 + 16);
          ctx.fillText(displayStr, 1024 + 6, 512 + 12);
          ctx.fillText(displayStr, 1024 + 4, 512 + 8);
          ctx.fillText(displayStr, 1024 + 2, 512 + 4);

          // Outer Contrast Bevel Stroke
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 18;
          ctx.strokeText(displayStr, 1024, 512);

          // Vivid Front Face Fill in activeTextColor (Filamento de Relieve)
          ctx.fillStyle = activeTextColor;
          ctx.fillText(displayStr, 1024, 512);
        }
      }
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

  // Build Geometry (only runs when modelType, custom3DFileUrl, or custom3DFileType changes)
  const buildGeometry = useCallback(() => {
    if (!meshGroupRef.current) return;
    const group = meshGroupRef.current;

    // Preserve rotation across rebuilds or set ergonomic angle
    const currentRotX = group.rotation.x || 0.08;
    const currentRotY = group.rotation.y || -0.15;
    const currentRotZ = group.rotation.z || 0;

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

    // Main Material
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(activeBaseColor),
      roughness: 0.22,
      metalness: 0.35,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1
    });
    materialsRef.current.mainMat = mainMaterial;

    // Accent Material
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeAccentColor),
      roughness: 0.25,
      metalness: 0.7
    });
    materialsRef.current.accentMat = accentMat;

    // Steel Ring Material
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      metalness: 0.95,
      roughness: 0.1
    });
    materialsRef.current.steelMat = steelMaterial;

    // --- CASE A: CUSTOM UPLOADED 3D FILE (.STL, .3MF, .GLB, .GLTF, .OBJ) ---
    if (custom3DFileUrl) {
      setLoading3D(true);
      const isSTL = custom3DFileType === 'stl' || (custom3DFileUrl && String(custom3DFileUrl).toLowerCase().includes('.stl'));
      const is3MF = custom3DFileType === '3mf' || (custom3DFileUrl && String(custom3DFileUrl).toLowerCase().includes('.3mf'));

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
          (err) => {
            console.error('STL Load Error:', err);
            setLoading3D(false);
          }
        );
      } else if (is3MF) {
        const loader = new ThreeMFLoader();
        loader.load(
          custom3DFileUrl,
          (object) => {
            object.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = mainMaterial;
              }
            });

            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);

            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = 4.0 / maxDim;
            object.scale.set(scale, scale, scale);

            group.add(object);
            setLoading3D(false);
          },
          undefined,
          (err) => {
            console.error('3MF Load Error:', err);
            setLoading3D(false);
          }
        );
      } else if (custom3DFileType === 'obj' || (custom3DFileUrl && String(custom3DFileUrl).toLowerCase().includes('.obj'))) {
        const loader = new OBJLoader();
        loader.load(
          custom3DFileUrl,
          (object) => {
            object.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = mainMaterial;
              }
            });

            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);

            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = 4.0 / maxDim;
            object.scale.set(scale, scale, scale);

            group.add(object);
            setLoading3D(false);
          },
          undefined,
          (err) => {
            console.error('OBJ Load Error:', err);
            setLoading3D(false);
          }
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
          (err) => {
            console.error('GLTF Load Error:', err);
            setLoading3D(false);
          }
        );
      }
      return;
    }

    // --- CASE B: PARAMETRIC 3D MODELS ---
    const textTexture = drawCanvas();

    const reliefFaceMat = new THREE.MeshPhysicalMaterial({
      map: textTexture,
      roughness: 0.2,
      metalness: 0.25,
      clearcoat: 0.5
    });
    materialsRef.current.reliefMat = reliefFaceMat;

    // 1. KEYCHAIN / TAG (Both +Z and -Z faces get reliefFaceMat so text is never hidden during rotation)
    if (modelType === 'keychain') {
      const plateGeo = new THREE.BoxGeometry(4.2, 2.0, 0.4);
      
      const plateMaterials = [
        mainMaterial, // +X right
        mainMaterial, // -X left
        mainMaterial, // +Y top
        mainMaterial, // -Y bottom
        reliefFaceMat, // +Z FRONT SURFACE (Ultra-crisp relief directly facing camera)
        reliefFaceMat  // -Z BACK SURFACE (Also textured during 360 spin)
      ];

      const mainMesh = new THREE.Mesh(plateGeo, plateMaterials);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      group.add(mainMesh);

      // Accent border rim (Zone 2)
      const rimGeo = new THREE.BoxGeometry(4.36, 2.16, 0.12);
      const rimMesh = new THREE.Mesh(rimGeo, accentMat);
      rimMesh.position.z = -0.15;
      group.add(rimMesh);

      // Keychain Ring (Steel)
      const ringGeo = new THREE.TorusGeometry(0.48, 0.08, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, steelMaterial);
      ringMesh.position.set(-2.55, 0, 0);
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
        reliefFaceMat,
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

      // 3D Custom Text Relief Plate on Sphere
      const plateGeo = new THREE.BoxGeometry(2.0, 0.8, 0.1);
      const plateMaterials = [mainMaterial, mainMaterial, mainMaterial, mainMaterial, reliefFaceMat, mainMaterial];
      const textPlate = new THREE.Mesh(plateGeo, plateMaterials);
      textPlate.position.set(0, 0, 1.8);
      group.add(textPlate);

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

      // 3D Custom Text Roof Plate
      const roofPlateGeo = new THREE.BoxGeometry(2.1, 0.08, 1.4);
      const roofMaterials = [mainMaterial, mainMaterial, reliefFaceMat, mainMaterial, mainMaterial, mainMaterial];
      const roofMesh = new THREE.Mesh(roofPlateGeo, roofMaterials);
      roofMesh.position.set(-0.2, 1.48, 0);
      group.add(roofMesh);

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

      // 3D Custom Text Relief Front Badge on Cup
      const cupPlateGeo = new THREE.BoxGeometry(1.8, 0.9, 0.1);
      const cupPlateMaterials = [mainMaterial, mainMaterial, mainMaterial, mainMaterial, reliefFaceMat, mainMaterial];
      const cupPlateMesh = new THREE.Mesh(cupPlateGeo, cupPlateMaterials);
      cupPlateMesh.position.set(0, 0, 1.55);
      group.add(cupPlateMesh);

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

    // 6. ORGANIZER (HexaDesk / Desk Station)
    else if (modelType === 'organizer') {
      // Main Organizer Body (Hexagonal / Beveled tray)
      const bodyGeo = new THREE.CylinderGeometry(2.4, 2.6, 1.8, 6);
      const bodyMesh = new THREE.Mesh(bodyGeo, mainMaterial);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // Accent Base Rim
      const baseRimGeo = new THREE.CylinderGeometry(2.7, 2.7, 0.25, 6);
      const baseRimMesh = new THREE.Mesh(baseRimGeo, accentMat);
      baseRimMesh.position.y = -0.95;
      group.add(baseRimMesh);

      // Front 3D Relief Plate
      const plateGeo = new THREE.BoxGeometry(3.2, 1.0, 0.15);
      const plateMaterials = [mainMaterial, mainMaterial, mainMaterial, mainMaterial, reliefFaceMat, mainMaterial];
      const plateMesh = new THREE.Mesh(plateGeo, plateMaterials);
      plateMesh.position.set(0, 0.1, 2.15);
      group.add(plateMesh);

      // Pen Cup / Compartment Ring
      const cupGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 16);
      const cupMesh = new THREE.Mesh(cupGeo, accentMat);
      cupMesh.position.set(0.9, 0.8, -0.6);
      group.add(cupMesh);
    }

    // 7. LAMP / LITOFANÍA
    else if (modelType === 'lamp') {
      // Lamp Base
      const baseGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.5, 32);
      const baseMesh = new THREE.Mesh(baseGeo, accentMat);
      baseMesh.position.y = -1.5;
      group.add(baseMesh);

      // Lamp Shade / Litofanía Screen with 3D Relief
      const shadeGeo = new THREE.BoxGeometry(2.8, 3.2, 1.2);
      const shadeMaterials = [
        mainMaterial,
        mainMaterial,
        accentMat,
        accentMat,
        reliefFaceMat, // Front
        reliefFaceMat  // Back
      ];
      const shadeMesh = new THREE.Mesh(shadeGeo, shadeMaterials);
      shadeMesh.position.y = 0.4;
      shadeMesh.castShadow = true;
      group.add(shadeMesh);

      // Glowing Core Accent
      const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff7ed });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.y = 0.4;
      group.add(coreMesh);
    }

    // 8. PLANTER / DEFAULT
    else {
      const planterGeo = new THREE.DodecahedronGeometry(1.8, 0);
      const planterMesh = new THREE.Mesh(planterGeo, mainMaterial);
      planterMesh.castShadow = true;
      group.add(planterMesh);

      // 3D Custom Text Relief Front Badge on Planter
      const planterPlateGeo = new THREE.BoxGeometry(1.8, 0.85, 0.1);
      const planterPlateMaterials = [mainMaterial, mainMaterial, mainMaterial, mainMaterial, reliefFaceMat, mainMaterial];
      const planterPlateMesh = new THREE.Mesh(planterPlateGeo, planterPlateMaterials);
      planterPlateMesh.position.set(0, 0, 1.6);
      group.add(planterPlateMesh);

      const trayGeo = new THREE.TorusGeometry(1.85, 0.1, 16, 6);
      const trayMesh = new THREE.Mesh(trayGeo, accentMat);
      trayMesh.rotation.x = Math.PI / 2;
      group.add(trayMesh);
    }

    group.rotation.set(currentRotX, currentRotY, currentRotZ);
  }, [modelType, custom3DFileUrl, custom3DFileType]);

  // Re-build geometry when modelType or custom 3D file changes
  useEffect(() => {
    buildGeometry();
  }, [buildGeometry]);

  // Instant in-place color & relief texture updates (No geometry rebuild, 0 lag!)
  useEffect(() => {
    if (materialsRef.current.mainMat) {
      materialsRef.current.mainMat.color.set(activeBaseColor);
    }
    if (materialsRef.current.accentMat) {
      materialsRef.current.accentMat.color.set(activeAccentColor);
    }
    drawCanvas();
    if (materialsRef.current.canvasTexture) {
      materialsRef.current.canvasTexture.needsUpdate = true;
    }
    if (materialsRef.current.reliefMat) {
      materialsRef.current.reliefMat.needsUpdate = true;
    }
  }, [activeBaseColor, activeAccentColor, activeTextColor, customText, fontFamily, logoImage, drawCanvas]);

  // Re-draw text when Google Fonts finish loading asynchronously
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawCanvas();
        if (materialsRef.current.canvasTexture) {
          materialsRef.current.canvasTexture.needsUpdate = true;
        }
        if (materialsRef.current.reliefMat) {
          materialsRef.current.reliefMat.needsUpdate = true;
        }
      });
    }
  }, [drawCanvas, fontFamily]);

  // Three.js Scene Setup Loop (Runs ONCE on mount)
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.2);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(6, 10, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5c4d4, 1.0);
    dirLight2.position.set(-6, -2, -6);
    scene.add(dirLight2);

    const group = new THREE.Group();
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
  }, []);

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
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#176B87' }}>Cargando modelo 3D...</span>
        </div>
      )}

      {/* Optional Floating Brand Badge in 3D Viewport */}
      {showFloatingBadge && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backdropFilter: 'blur(6px)',
            zIndex: 10,
            border: '1px solid rgba(23, 107, 135, 0.15)'
          }}
        >
          <IdeaFormLogo size="small" showTagline={false} />
          <span style={{ fontSize: '0.62rem', color: '#176B87', fontWeight: '800', paddingLeft: '0.35rem', borderLeft: '1px solid #cbd5e1', letterSpacing: '0.05em' }}>
            3D LIVE
          </span>
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
          <span>{isAutoRotating ? '360°' : 'Pausa'}</span>
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
