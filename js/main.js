// References
// http://threejs.org/examples/webgl_particles_random.html
// http://www.ro.me/tech/mouse-in-3d-space

var container;
var scene, camera, controls, renderer;
var uniforms, attributes, material;
var time = 0;
var mesh, uniforms, attributes;
var p = [];
var mouse2d;
var particleCount = 500000;
var particlesGeometry = new THREE.Geometry();


// Uniforms
var waveHeights = []; // not this one
var waveLength = 80.0;
var waveAmplitude = 90.0;
var zRotation = 4.0;
var noiseScale = 50.0;
var maincolor = new THREE.Color(0x0000FF);
var subcolor = new THREE.Color(0xFFFFFF);
var wavespeed = 1.0;

window.addEventListener('load', function()
{
	container = document.getElementById("container");
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45 , window.innerWidth / window.innerHeight, 0.01, 100000);
	camera.position.set(0, 4000, -4000);
	camera.aspect = 2;
	camera.lookAt(scene.position);
	scene.add(camera);

	mouse2d = new THREE.Vector3(0, 0, 1);

	renderer = new THREE.WebGLRenderer({});
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);
	container.onmousemove=onDocumentMouseMove;

	generateCloud(particleCount);

	p = [];
	for (var i = 0; i < 256; i++) {
		p.push(Math.random()*256);
	}

	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 20; j++) {
			var n = octaveNoise(i/8, j/8, 8);
			n = clamp(n*0.5+0.5,0.0,1.0);
			waveHeights.push(n);
		}
	}

	render();
});

function generateCloud(pnum) {
	if (scene.children.length == 2) {
		scene.children.pop();
		particlesGeometry = new THREE.Geometry();
	}
	for (var p = 0; p < pnum; p++) {
		var px, py, pz;
		var vec;
		do {
			px = Math.random()* 3000 - 1500;
			py = Math.random()* 200 - 100;
			pz = Math.random()* 3000 - 1500;
		} while(Math.sqrt(px*px+pz*pz) > 1500);
		
		vec = new THREE.Vector3(px, py, pz);
		particlesGeometry.vertices.push(vec);
	}

	uniforms = {
		time: 				{ type: "f", 	value: time },
		waveHeights: 		{ type: "fv1", 	value: waveHeights },
		waveHeightLength: 	{ type: "f", 	value: waveHeights.length },
		waveLength: 		{ type: "f", 	value: waveLength },
		waveAmplitude: 		{ type: "f", 	value: waveAmplitude },
		zRotation: 			{ type: "f", 	value: zRotation },
		noiseScale: 		{ type: "f", 	value: noiseScale },
		maincolor: 			{ type: "c", 	value: maincolor },
		subcolor: 			{ type: "c", 	value: subcolor },
		wavespeed: 			{ type: "f", 	value: wavespeed}
	};

	var shader = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
		transparent: true
	});
	mesh = new THREE.PointCloud(particlesGeometry, shader);
	scene.add(mesh);
}

function animation() {
	time++;

	uniforms.time.value = time;
	uniforms.waveLength.value = $('#wavelength').val();
	uniforms.waveAmplitude.value = $('#waveamplitude').val();
	uniforms.zRotation.value = zRotation;
	uniforms.noiseScale.value = $('#noisescale').val();
	uniforms.maincolor.value.setRGB($('#c1r').val()/255, $('#c1g').val()/255, $('#c1b').val()/255);
	uniforms.subcolor.value.setRGB($('#c2r').val()/255, $('#c2g').val()/255, $('#c2b').val()/255);
	uniforms.wavespeed.value = $('#wavespeed').val();
	mesh.geometry.verticesNeedUpdate = true;
}

function render()
{
	requestAnimationFrame(render);
	animation();
	renderer.render(scene, camera);
};

// https://github.com/Reputeless/PerlinNoise
function clamp(x, min, max) {
	return (x < min) ? min : ((max < x) ? max : x);
}

function octaveNoise(x, y)
{
	var result = 0.0;
	var amp = 1.0;
	var octaves = 8;

	for(var i = 0; i < octaves; i += 1)
	{
		result += noise(x, y) * amp;
		x *= 2.0;
		y *= 2.0;
		amp *= 0.5;
	}
	return result;
}
function noise(x, y)
{
	var z = 0.0;
	var X = Math.floor(x) & 255;
	var Y = Math.floor(y) & 255;
	var Z = Math.floor(z) & 255;
	x -= Math.floor(x);
	y -= Math.floor(y);
	z -= Math.floor(z);
	var u = fade(x);
	var v = fade(y);
	var w = fade(z);
	var A = p[X] + Y;
	var AA = p[A] + Z;
	var AB = p[A+1] + Z;
	var B = p[X+1] + Y;
	var BA = p[B] + Z;
	var BB = p[B+1] + Z;
	return lerp(w,
		lerp(v,
			lerp(u,
				grad(p[AA], x, y, z),
				grad(p[BA], x-1.0, y, z)),
			lerp(u,
				grad(p[AB], x, y-1.0, z),
				grad(p[BB], x-1.0, y-1.0, z))),
		lerp(v,
			lerp(u,
				grad(p[AA+1], x, y, z-1.0),
				grad(p[BA+1], x-1.0, y, z-1.0)),
		lerp(u,
			grad(p[AB+1], x, y-1.0, z-1.0),
			grad(p[BB+1], x-1.0, y-1.0, z-1.0))));
		
}
function fade(t){return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);}
function lerp(t, a, b){return a + t * (b - a);}
function grad(hash, x, y, z)
{
	var h = hash & 15;
	var u = h < 8.0 ? x : y;
	var v = h < 4.0 ? y : h == 12.0 || h == 14.0 ? x : z;
	return ((h & 1.0) == 0.0 ? u : -u) + ((h & 2.0) == 0.0 ? v : -v);
}
function onDocumentMouseMove(event)
{
	event.preventDefault();
	mouse2d.x=(event.clientX/window.innerWidth)*2-1;
	mouse2d.y=-(event.clientY/window.innerHeight)*2+1;
	mouse2d.z=1;
}