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

	//material = new THREE.MeshBasicMaterial({color: 0xb7ff00, wireframe: true});
	material = new THREE.ShaderMaterial({
		uniforms:{
			time:{ type: "f", value: 1.0},
			resolution: { type: "v2", value: new THREE.Vector2()}
		},
		attributes:{
			vertexOpacity:{ type: 'f', value: [] }
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent,
		side: THREE.DoubleSide
	});
	start = Date.now();

	cube = new THREE.Mesh(new THREE.IcosahedronGeometry(20, 7), material);
	scene.add(cube);

	render();
});

function render()
{
	material.uniforms['time'].value = 0.00025 * Date.now() - start;
	requestAnimationFrame(render);
	//animation();
	renderer.render(scene, camera);
};