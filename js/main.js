var container;
var scene, camera, controls, renderer;
var uniforms, attributes, material;
var start;
var cube;



window.addEventListener('load', function()
{
	container = document.getElementById("container");
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100000);
	camera.position.set(0, 0, -25);
	camera.aspect = 2;
	camera.lookAt(scene.position);
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({});
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);

	var particleCount = 2000;
	var particlesGeometry = new THREE.Geometry();
	var particleMaterial = new THREE.PointCloudMaterial({color: 0x555555, size: 20});
	for (var p = 0; p < particleCount; p++) {
		var px = Math.random()*500 - 250;
		var py = Math.random()*500 - 250;
		var pz = Math.random()*500 - 250;
		var particle = new THREE.Vector3(px, py, pz);
		particlesGeometry.vertices.push(particle);


	}

	var cloud = new THREE.PointCloud( particlesGeometry, particleMaterial );
	scene.add(cloud);
	// // var particleSystem = new THREE.Geometry(particles, particleMaterial);
	// var particles = new THREE.PointCloudMaterial(particlesGeometry, particleMaterial);
	// scene.add(particles);
	render();
});



function render()
{
	// material.uniforms['time'].value = 0.00025 * Date.now() - start;
	requestAnimationFrame(render);
	//animation();
	renderer.render(scene, camera);
};