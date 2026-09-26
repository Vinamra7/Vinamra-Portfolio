import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const vertexShader = `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position,1.0);}`;
const fragmentShader = `
uniform sampler2D image; uniform float time; uniform float colour; uniform float astronaut; uniform float motion;
uniform vec2 resolution; varying vec2 vUv;
float rand(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec4 sampleAt(vec2 p){if(p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0)return vec4(0.0);return texture2D(image,p);}
void main(){
 vec2 uv=vUv;
 float band=smoothstep(.28,.44,uv.y)*(1.0-smoothstep(.55,.66,uv.y));
 float row=floor(uv.y*150.0);
 float tear=(rand(vec2(row,floor(time*5.0)))-.5)*.038*band*astronaut*motion;
 uv.x+=tear;
 vec4 main=sampleAt(uv);
 if(astronaut>.5){
   main=main*.38+(sampleAt(uv+vec2(.003,0.))+sampleAt(uv-vec2(.003,0.)))*.19;
   main+=(sampleAt(uv+vec2(0.,.002))+sampleAt(uv-vec2(0.,.002)))*.12;
 }
 vec4 ghost=sampleAt(vec2(1.12-uv.x,uv.y-.025));
 vec4 echo=sampleAt(uv+vec2(.026,-.008));
 vec3 rgb=main.rgb;
 float alpha=main.a;
 if(astronaut>.5){
   float ghostGrey=dot(ghost.rgb,vec3(.299,.587,.114));
   rgb+=vec3(ghostGrey)*.32*(1.0-alpha*.8);
   rgb+=echo.rgb*.05*(1.0-alpha);
   alpha=max(alpha,ghost.a*.32);
   float shift=.0023+band*.004;
   rgb.r=mix(rgb.r,sampleAt(uv+vec2(shift,0.)).r,.3+band*.3);
   rgb.b=mix(rgb.b,sampleAt(uv-vec2(shift,0.)).b,.3+band*.3);
   float grey=dot(rgb,vec3(.299,.587,.114));
   rgb=vec3(grey);
   vec4 trail=sampleAt(vec2(uv.x+tear*.8, max(uv.y,.43)));
   float threads=step(.66,rand(vec2(floor(uv.x*310.),1.)));
   rgb+=vec3(dot(trail.rgb,vec3(.299,.587,.114)))*threads*.12*band;
   float edge=abs(sampleAt(uv+vec2(.008,0.)).a-sampleAt(uv-vec2(.008,0.)).a);
   float seam=abs(dot(sampleAt(uv+vec2(.006,0.)).rgb-sampleAt(uv-vec2(.006,0.)).rgb,vec3(.333)));
   vec3 spectrum=.5+.5*cos(vec3(0.,2.1,4.2)+uv.y*32.+uv.x*18.);
   rgb+=spectrum*colour*(band*(seam*2.1+threads*.035)+edge*.11);
   rgb*=1.0-band*.38;
   alpha*=smoothstep(.06,.34,vUv.y)*(1.0-smoothstep(.90,1.,vUv.y));
   rgb*=1.0-sin(uv.y*resolution.y*1.3)*.025;
 }
 float grain=(rand(vUv*resolution+floor(time*8.0)*motion)-.5)*.006;
 vec3 background=vec3(0.0);
 rgb=mix(background,rgb,clamp(alpha,0.,1.));
 rgb+=grain*clamp(alpha,0.,1.);
 gl_FragColor=vec4(rgb,astronaut>.5?clamp(alpha,0.,1.):1.0);
 #include <colorspace_fragment>
}`;

export default function Scene({ variant, paused }) {
  const host = useRef(null),
    pauseRef = useRef(paused);
  const [failed, setFailed] = useState(false),
    [colourOn, setColourOn] = useState(false);
  useEffect(() => {
    pauseRef.current = paused;
  }, [paused]);
  useEffect(() => {
    const el = host.current;
    let disposed = false,
      renderer,
      raf,
      visible = false,
      hovered = false,
      colour = 0,
      model;
    let previous = 0,
      elapsed = 0;
    const astronaut = variant === "astronaut";
    const cursor = new THREE.Vector2();
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      astronaut ? 32 : 52,
      1,
      0.1,
      100,
    );
    const postScene = new THREE.Scene(),
      postCamera = new THREE.Camera();
    const target = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    const post = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        image: { value: target.texture },
        time: { value: 0 },
        colour: { value: 0 },
        astronaut: { value: astronaut ? 1 : 0 },
        motion: { value: 1 },
        resolution: { value: new THREE.Vector2(1, 1) },
      },
    });
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    postScene.add(new THREE.Mesh(quadGeometry, post));
    const group = new THREE.Group();
    scene.add(group);
    function track(object) {
      object.traverse((child) => {
        if (child.geometry) geometries.add(child.geometry);
        if (child.material) {
          for (const mat of Array.isArray(child.material)
            ? child.material
            : [child.material]) {
            materials.add(mat);
            for (const value of Object.values(mat))
              if (value?.isTexture) textures.add(value);
          }
        }
      });
    }
    function draw() {
      if (disposed || !renderer) return;
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    }
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.domElement.setAttribute("aria-hidden", "true");
      el.appendChild(renderer.domElement);
      if (astronaut) {
        camera.position.set(0, 0.6, 5.7);
        camera.lookAt(0, 0.7, 0);
        scene.add(new THREE.HemisphereLight(0xd3eeee, 0x39313e, 1.1));
        const key = new THREE.DirectionalLight(0xf7ede3, 1.8);
        key.position.set(-3, 5, 6);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x6dabab, 2);
        rim.position.set(4, 2, -2);
        scene.add(rim);
        new GLTFLoader().load(
          "/Models/low_poly_astro.glb",
          (gltf) => {
            if (disposed) {
              track(gltf.scene);
              geometries.forEach((g) => g.dispose());
              materials.forEach((m) => m.dispose());
              textures.forEach((t) => t.dispose());
              return;
            }
            track(gltf.scene);
            let source;
            gltf.scene.traverse((obj) => {
              if (obj.isMesh && !source) source = obj;
            });
            if (!source) {
              setFailed(true);
              return;
            }
            const geometry = source.geometry.clone();
            geometries.add(geometry);
            geometry.computeBoundingBox();
            const center = geometry.boundingBox.getCenter(new THREE.Vector3());
            const size = geometry.boundingBox.getSize(new THREE.Vector3());
            geometry.translate(-center.x, -center.y, -center.z);
            const material = source.material.clone();
            material.roughness = 0.95;
            material.metalness = 0;
            material.side = THREE.FrontSide;
            materials.add(material);
            model = new THREE.Mesh(geometry, material);
            model.scale.setScalar(4.0 / size.y);
            model.rotation.set(0.06, -1.57, -0.08);
            group.add(model);
            group.position.x = -0.23;
            draw();
          },
          undefined,
          () => {
            if (!disposed) setFailed(true);
          },
        );
      }
    } catch {
      setFailed(true);
    }
    function resize() {
      if (!renderer || disposed) return;
      const w = el.clientWidth,
        h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      target.setSize(
        Math.round(w * Math.min(window.devicePixelRatio, 1.5)),
        Math.round(h * Math.min(window.devicePixelRatio, 1.5)),
      );
      post.uniforms.resolution.value.set(w, h);
      draw();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);
    resize();
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) draw();
      },
      { rootMargin: "40px" },
    );
    observer.observe(el);
    function move(e) {
      const r = el.getBoundingClientRect();
      cursor.set(
        (e.clientX - r.left) / r.width - 0.5,
        (e.clientY - r.top) / r.height - 0.5,
      );
    }
    function enter(e) {
      if (e.pointerType === "touch") return;
      hovered = true;
      setColourOn(true);
    }
    function leave() {
      hovered = false;
      cursor.set(0, 0);
      setColourOn(false);
      colour = 0;
      post.uniforms.colour.value = 0;
      draw();
    }
    function toggle() {
      hovered = !hovered;
      setColourOn(hovered);
      if (!hovered) leave();
    }
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);
    function key(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    }
    function touch(e) {
      if (e.pointerType === "touch") toggle();
    }
    el.addEventListener("keydown", key);
    el.addEventListener("pointerup", touch);
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden || now - previous < 33) return;
      const delta = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (!pauseRef.current) elapsed += delta;
      const nextColour = THREE.MathUtils.damp(
        colour,
        hovered ? 1 : 0,
        1.8,
        delta,
      );
      const changed = Math.abs(nextColour - colour) > 0.0002;
      colour = nextColour;
      if (pauseRef.current && !changed) return;
      post.uniforms.colour.value = colour;
      post.uniforms.time.value = elapsed;
      post.uniforms.motion.value = pauseRef.current ? 0 : 1;
      if (astronaut && model) {
        model.rotation.y = THREE.MathUtils.damp(
          model.rotation.y,
          -1.57 + cursor.x * 0.08,
          3,
          delta,
        );
        model.rotation.x = THREE.MathUtils.damp(
          model.rotation.x,
          0.06 + cursor.y * 0.12,
          3,
          delta,
        );
        model.position.y = pauseRef.current
          ? 0
          : Math.sin(elapsed * 0.65) * 0.06;
      }
      draw();
    }
    raf = requestAnimationFrame(frame);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", enter);
      el.removeEventListener("blur", leave);
      el.removeEventListener("keydown", key);
      el.removeEventListener("pointerup", touch);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      target.dispose();
      post.dispose();
      quadGeometry.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [variant]);
  return (
    <div
      className={`scene-host ${colourOn ? "colour-active" : ""}`}
      ref={host}
      tabIndex={variant === "astronaut" ? 0 : undefined}
      role={variant === "astronaut" ? "button" : undefined}
      aria-label={
        variant === "astronaut"
          ? "Explore astronaut: hover, tap or press Enter to illuminate the glitch in blue"
          : undefined
      }
      aria-pressed={variant === "astronaut" ? colourOn : undefined}
    >
      {failed && variant === "astronaut" && (
        <div className="scene-fallback mono">
          EXPLORER / OFFLINE
          <br />
          <small>3D view unavailable on this device.</small>
        </div>
      )}
    </div>
  );
}
