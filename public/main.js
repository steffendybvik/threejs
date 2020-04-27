import * as THREE from '/three/build/three.module.js';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from '/three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from '/three/examples/jsm/utils/RoughnessMipmapper.js';

let gltfPath = './models/beetle/';
let modelName = 'beetle.gltf';
let texturePath = '/textures/';
let textureName = 'glass_passage_2k.hdr'

var container, controls;
var camera, scene, renderer;

init();
render();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    //camera.position.set(- 1.8, 0.6, 2.7);
    camera.position.z = 15;
    camera.position.y = 15;
    camera.position.x = -10;

    scene = new THREE.Scene();
    shadowCatcherFloor();


    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath(texturePath)
        .load(textureName, function (texture) {


            var envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.background = envMap;
            scene.environment = envMap;

            texture.dispose();
            pmremGenerator.dispose();

            render();

            // model

            // use of RoughnessMipmapper is optional
            var roughnessMipmapper = new RoughnessMipmapper(renderer);

            var loader = new GLTFLoader().setPath(gltfPath);
            loader.load(modelName, function (gltf) {
                let model = gltf.scene;
                fitToSize(model);

                gltf.scene.traverse(function (child) {

                    if (child.isMesh) {

                        roughnessMipmapper.generateMipmaps(child.material);

                    }

                });

                scene.add(gltf.scene);

                roughnessMipmapper.dispose();

                render();

            });

        });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    var pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set(0, 0, - 0.2);
    controls.update();

    window.addEventListener('resize', onWindowResize, false);

}

function fitToSize(localmodel) {
    localmodel.position.set(0, 0, 0);

    localmodel.scale.set(1, 1, 1);

    var box = new THREE.Box3().setFromObject(localmodel);

    var maxSize = Math.max(box.max.x - box.min.x, Math.max(box.max.y - box.min.y, box.max.z - box.min.z));

    var scale = (1 / maxSize) * 4;

    var yObjectOffset = 1.5 - ((box.max.y - box.min.y) * scale / 2);

    //floorPlane.position.y = yObjectOffset - 0.1;

    localmodel.scale.set(scale, scale, scale);

    console.log(yObjectOffset);

    localmodel.position.set(-(box.min.x * scale) - ((box.max.x - box.min.x) * scale / 2), -(box.min.y * scale) + yObjectOffset, -(box.min.z * scale) - ((box.max.z - box.min.z) * scale / 2));
}

function shadowCatcherFloor() {
    let shadowMatteMaterial = new THREE.ShadowMaterial();
    shadowMatteMaterial.opacity = 0.05;

    // PBR Material
    let material = new THREE.MeshStandardMaterial({
        color: 0xDCDCDC
    });
    material.roughness = 0.8;
    material.metalness = 0.2;
    //material.wireframe = true;
    material.receiveShadow = true;
    material.castShadow = true;

    // Plane
    let plane = new THREE.PlaneGeometry(5, 5, 1);
    let floorPlane = new THREE.Mesh(plane, shadowMatteMaterial);
    floorPlane.rotation.x = -90 * Math.PI / 180;
    floorPlane.position.y = 0;
    floorPlane.receiveShadow = true;
    floorPlane.castShadow = true;
    scene.add(floorPlane);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

//

function render() {

    renderer.render(scene, camera);

}