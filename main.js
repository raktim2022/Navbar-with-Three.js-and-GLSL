import "./style.css";
import "remixicon/fonts/remixicon.css";
import * as THREE from "three";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
import gsap  from "gsap";


class Site {
  constructor({ dom }) {
    this.time = 0;
    this.container = dom;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.images = [...document.querySelectorAll(".images img")];
    this.material;
    this.imageStore = [];
    this.uStartIndex = 0;
    this.uEndIndex = 1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      100,
      2000
    );

    this.camera.position.z = 200;
    this.camera.fov = 2 * Math.atan(this.height / 2 / 200) * (180 / Math.PI);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this.renderer.render(this.scene, this.camera);

    // this.addObject()
    this.setPosition();
    this.addImages();
    this.resize();
    this.hoverOverLinks();
    this.setResize();
    this.render();
  }

  // addObject() {
  //   this.geometry = new THREE.BoxGeometry(1, 1, 1);
  //   this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  //   this.cube = new THREE.Mesh(this.geometry, this.material);
  //   this.scene.add(this.cube);
  // }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.setPosition();
  }
  setResize() {
    window.addEventListener("reset", this.resize.bind(this));
  }

  setPosition() {
    this.imageStore.forEach((img) => {
      const bound = img.img.getBoundingClientRect();
      img.mesh.position.y = -bound.top + this.height / 2 - bound.height / 2;
      img.mesh.position.x = bound.left - this.width / 2 + bound.width / 2;
    });
  }

  addImages() {
    const textureLoader = new THREE.TextureLoader();
    const texture = this.images.map((img) => textureLoader.load(img.src));

    const uniforms = {
      uTime: { vale: 0 },
      uTimeline: { value: 0.2 },
      uStartIndex: { value: 0 },
      uEndIndex: { value: 1 },
      uImage1: { value: texture[0] },
      uImage2: { value: texture[1] },
      uImage3: { value: texture[2] },
      uImage4: { value: texture[3] },
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      uniforms: uniforms,
    });

    this.images.forEach((img) => {
      const bound = img.getBoundingClientRect();
      const geometry = new THREE.PlaneGeometry(bound.width, bound.height);
      const mesh = new THREE.Mesh(geometry, this.material);

      this.scene.add(mesh);
      this.imageStore.push({
        img: img,
        mesh: mesh,
        top: bound.top,
        left: bound.left,
        width: bound.width,
        height: bound.height,
      });
    });
  }

  hoverOverLinks() {
    const links = document.querySelectorAll(".links a");
    links.forEach((link, i) => {
      link.addEventListener("mouseover", (e) => {
        this.material.uniforms.uTimeline.value = 0.0;

        gsap.to(this.material.uniforms.uTimeline, {
          value: 3.0,
          duration: 1.5,
          onStart: () => {
            this.uEndIndex = i;
            this.material.uniforms.uStartIndex.value = this.uStartIndex;
            this.material.uniforms.uEndIndex.value = this.uEndIndex;
            this.uStartIndex = this.uEndIndex;
          },
        });
      });
    });
  }

  render() {
    this.time += 0.1;
    this.material.uniforms.uTime.value = this.time;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Site({
  dom: document.querySelector(".canvas"),
});
