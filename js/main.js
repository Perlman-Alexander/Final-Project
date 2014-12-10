// References
// http://threejs.org/examples/webgl_particles_random.html
// http://www.ro.me/tech/mouse-in-3d-space

var container;
var scene, camera, controls, renderer;
var uniforms, attributes, material;
var start;
var cube;
var time = 0;
var mouse2d;
var intersectingCloud = false;
var cloud = [];

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

	mouse2d = new THREE.Vector3(0, 0, 1);

	container.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);
	container.onmousemove=onDocumentMouseMove;

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
		particlesGeometry.vertices.push(vec);
	}

	var colors = [0xffa22b, 0xe87727, 0xff6d37, 0xe83f27, 0xff2b3b];
	for (var i = 0; i < 1; i++) {
		var particleMaterial = new THREE.PointCloudMaterial({color: colors[(i)%5], size: 1});
		cloud.push(new THREE.PointCloud( particlesGeometry, particleMaterial));
		scene.add(cloud[i]);
	}
	render();
});

function animation() {
	time++;
	for (var i = 0; i < scene.children.length; i++) {
		var object = scene.children[i];
		if (object instanceof THREE.PointCloud) {
			//object.rotation.y = Math.sin(time)*Math.random()*10;
		}
	}
	mouseRay();
}

function mouseRay() {
	var r=new THREE.Ray();
	r.origin=mouse2d.clone();
	var matrix=camera.matrixWorld.clone();
	var invert = new THREE.Matrix4().getInverse(camera.projectionMatrix);
	matrix.multiply(invert);
	matrix.scale(r.origin);
	r.direction=r.origin.clone().sub(camera.position);
	ts=new Date().getTime();
	var cs= new THREE.Raycaster();
	cs.ray = r;
	var intersecting = cs.intersectObject(cloud[0], intersectingCloud);
	tt=new Date().getTime()-ts;
	if(intersecting.length>0)
	{
		// info.innerHTML=cs.length+" colliders found in "+tt;
		for(var i=0;i<intersecting.length;i++)
		{
			cloud[0] .material.color.set(0x0000FF);
		}
	}
	else
	{
		cloud[0] .material.color.set(0x00FF00);
	}
}

function render()
{
	requestAnimationFrame(render);
	animation();
	renderer.render(scene, camera);
};

function onDocumentMouseMove(event)
{
	event.preventDefault();
	mouse2d.x=(event.clientX/window.innerWidth)*2-1;
	mouse2d.y=-(event.clientY/window.innerHeight)*2+1;
	mouse2d.z=1;
	// console.log(mouse2d);
}
