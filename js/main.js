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
var mesh, uniforms, attributes;

window.addEventListener('load', function()
{
	container = document.getElementById("container");
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45 , window.innerWidth / window.innerHeight, 0.01, 100000);
	camera.position.set(0, 0, -1400);
	camera.aspect = 2;
	camera.lookAt(scene.position);
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({});
	renderer.setSize(window.innerWidth, window.innerHeight);

	mouse2d = new THREE.Vector3(0, 0, 1);

	container.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);
	container.onmousemove=onDocumentMouseMove;

	var mesh2 = new THREE.Mesh(new THREE.BoxGeometry(500, 200, 500), new THREE.MeshNormalMaterial());
	var boundingBox = new THREE.BoxHelper(mesh2);
	boundingBox.material.color.setHex(0xFFFFFF);
	scene.add(boundingBox);

	var particleCount = 500000;
	var particlesGeometry = new THREE.Geometry();
	for (var p = 0; p < particleCount; p++) {
		var px, py, pz;
		var vec;
		px = Math.random()* 500 - 250;
		py = Math.random()* 200 - 100;
		pz = Math.random()* 500 - 250;
		vec = new THREE.Vector3(px, py, pz);
		particlesGeometry.vertices.push(vec);
	}

	uniforms = {
		color: {
			type: "c", value: new THREE.Color(0x4433CC)
		},
	};

	attributes = {
		alpha: {
			type: "f", value: []
		},
		time: {
			type: "f", value: []
		}
	};

	var shader = new THREE.ShaderMaterial({
		uniforms: uniforms,
		attributes: attributes,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
		transparent: true
	});

	mesh = new THREE.PointCloud(particlesGeometry, shader);


	for( var i = 0; i < mesh.geometry.vertices.length; i ++ ) {
	
		// set alpha randomly
		attributes.alpha.value[ i ] = 0.75;
		attributes.time.value[ i ] = 0;

	}

	
	// mesh.material.wireframe = true;
	// mesh.material.color.set(0xb7ff00);
	scene.add(mesh);
	render();
});

function animation() {
	time++;
	for( var i = 0; i < attributes.time.value.length; i ++ ) {
	
		// dynamically change alphas
		attributes.alpha.value[ i ] *= 0.9;
		attributes.time.value[i] = time;
		
		if ( attributes.alpha.value[ i ] < 0.2 ) { 
			attributes.alpha.value[ i ] = 1.0;
		}
		
	}

	// attributes.alpha.needsUpdate = true;
	attributes.time.needsUpdate = true;
	// mesh.rotation.x += 0.005;
	// mesh.rotation.y += 0.005;
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
