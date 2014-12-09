var container;
var scene, camera, controls, renderer;
var uniforms, attributes, material;
var start;
var cube;
var time = 0;


window.addEventListener('load', function()
{
	container = document.getElementById("container");
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100000);
	camera.position.set(0, 0, -2000);
	camera.aspect = 2;
	camera.lookAt(scene.position);
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({});
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);

	var particleCount = 2000;
	var particlesGeometry = new THREE.Geometry();
	for (var p = 0; p < particleCount; p++) {
		var px = Math.random()*500 - 250;
		var py = Math.random()*500 - 250;
		var pz = Math.random()*500 - 250;
		var particle = new THREE.Vector3(px, py, pz);
		particlesGeometry.vertices.push(particle);

	}

	var colors = [0xffa22b, 0xe87727, 0xff6d37, 0xe83f27, 0xff2b3b];
	for (var i = 0; i < colors.length; i++) {
		var particleMaterial = new THREE.PointCloudMaterial({color: colors[i], size: 20});
		var cloud = new THREE.PointCloud( particlesGeometry, particleMaterial );
		scene.add(cloud);
	}

	
	// // var particleSystem = new THREE.Geometry(particles, particleMaterial);
	// var particles = new THREE.PointCloudMaterial(particlesGeometry, particleMaterial);
	// scene.add(particles);
	render();
});

function animation() {
	time++;
	for (var i = 0; i < scene.children.length; i++) {
		var object = scene.children[i];
		if (object instanceof THREE.PointCloud) {
			object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
		}
	}
}

function render()
{
	// material.uniforms['time'].value = 0.00025 * Date.now() - start;
	requestAnimationFrame(render);
	animation();
	renderer.render(scene, camera);
};


/*
Colors
ffa22b
e87727
ff6d37
e83f27
ff2b3b
*/