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
	camera.position.set(0, 0, -1000);
	camera.aspect = 2;
	camera.lookAt(scene.position);
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({});
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);

	var particleCount = 500;
	var particlesGeometry = new THREE.Geometry();
	for (var p = 0; p < particleCount * 5; p++) {
		var px, py, pz;
		var vec;
		do {
			px = Math.random()* 200 - 100;
			py = Math.random()* 200 - 100;
			pz = Math.random()* 200 - 100;
			vec = new THREE.Vector3(px, py, pz);
		} while(vec.length() > 100);
		
		// var particle = new THREE.Vector3(px, py, pz);
		particlesGeometry.vertices.push(vec);
	}

	var colors = [0xffa22b, 0xe87727, 0xff6d37, 0xe83f27, 0xff2b3b];
	for (var i = 0; i < 10; i++) {
		var particleMaterial = new THREE.PointCloudMaterial({color: colors[(i)%5], size: 1});
		var cloud = new THREE.PointCloud( particlesGeometry, particleMaterial );
		scene.add(cloud);
	}
	render();
});

function animation() {
	time++;
	for (var i = 0; i < scene.children.length; i++) {
		var object = scene.children[i];
		if (object instanceof THREE.PointCloud) {
			object.rotation.y = Math.sin(time)*Math.random()*10;
		}
	}
}

function render()
{
	requestAnimationFrame(render);
	animation();
	renderer.render(scene, camera);
};
