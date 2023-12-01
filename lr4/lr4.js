import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from 'mindar-image-three';


export const loadVideo = (path) => {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
			video.addEventListener("loadeddata", () => {
				video.setAttribute("playsinline", "");
				video.setAttribute("loop", "");
				resolve(video);
			});
		video.src = path;
	});
}


document.addEventListener("DOMContentLoaded", () => {
	const start = async() => {
		const mindarThree = new MindARThree({
			container: document.body,
			imageTargetSrc: "markers.mind",
			uiScanning: "yes",
			uiLoading: "yes",
			maxTrack: 3,
		      });
		const {renderer, scene, camera} = mindarThree;

		const anchor_go = mindarThree.addAnchor(0);
		const anchor_parody = mindarThree.addAnchor(1);

		var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 5);
		scene.add(light);

		const loader = new GLTFLoader();

		var model_ship = 0;

		loader.load("submarine.glb", (model1) => {
			anchor_go.group.add(model1.scene);
			model1.scene.scale.set(0.5, 0.5, 0.5);
			model1.scene.position.set(0, 0, 0);
			model1.scene.userData.clickable = true;
			model_ship = model1;
		});

		const video = await loadVideo("bubbles.mp4");
		video.muted = true;
		const texture = new THREE.VideoTexture(video);

		const geometry1 = new THREE.PlaneGeometry(1, 1280.0/720);
		const material1 = new THREE.MeshBasicMaterial( {map: texture} );
		const plane = new THREE.Mesh( geometry1, material1 );
		plane.position.set(0, 0, 0);
        plane.scale.set(2, 2, 2);
        plane.rotation.set(0, 0, 90)
		anchor_parody.group.add(plane);

		anchor_parody.onTargetFound = () => {
			video.play();
		}

		anchor_parody.onTargetLost = () => {
			video.pause();
		}

		video.addEventListener("play", () => {
			video.currentTime = 0;
		});


		document.body.addEventListener("click", (e) => {
			const mouseX = ( e.clientX / window.innerWidth ) * 2 - 1;
			const mouseY = - ( ( e.clientY / window.innerHeight ) * 2 - 1 );
			const mouse = new THREE.Vector2(mouseX, mouseY);
			const raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(mouse, camera);
			const intersects=raycaster.intersectObjects(scene.children, true);
			if(intersects.length>0) {
				let o = intersects[0].object;
				while(o.parent && !o.userData.clickable)
					o = o.parent;
				if(o.userData.clickable && o === model_ship.scene)
				{
					model_ship.scene.rotation.z += (45*Math.random()+45) * Math.PI/180;
				}
			}
		});

		await mindarThree.start();
		renderer.setAnimationLoop(() => {
			  renderer.render(scene, camera);
		});
	}
	start();
});