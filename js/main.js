/*
* Module      : Wave Simulator
* Author      : Maxwell Perlman & Stefan Alexander
* Email       : mhperlman@wpi.edu & sualexander.wpi.edu
* Course      : CS 4732
* Description : Final project
* Date        : 2014/11/30
* Revision      Date          Changed By
* --------      ----------    -----------------------
* 01.00         2014/12/15    mhperlman & sualexander
*/
/*INCLUDED FILES AND REFERENCES*/
/* three.min.js:
	The WebGL library used to draw the scene
 * OribtControl.js:	Mouse Control:
	Left click and drag the mouse to rotate the camera.
	Middle click and drag the mouse to zoom in and out.
	Right click and drag the mouse to pan the camera.
 * jquery-1.11.1.min.js:
	Required for sliders
 * rangeslider.min.js:
	Used for adjustment sliders
 * http://threejs.org/examples/webgl_particles_random.html
 * https://github.com/Reputeless/PerlinNoise
*/
/*GLOBAL VARIABLES*/
/*
 * container: the html div into which the scene is rendered
 * scene: the scene that is drawn each frame
 * camera: the camera looking at the scene
 * controls: the orbit controls of the camera
 * renderer: controls the rendering of the scene
 * uniforms: variables sent to the shaders
 * mesh: the wave object in the scene
 * time: the number of frames that have passed
 * p: used for the calculation of the perlin noise
 * particleCount: the number of particles to be generated for the scene
 * particleGeometry: the particles stored in the mesh
 * waveHeights: the array of generated perlin noise values
 * waveLength: the wavelength of the wave
 * waveAmplitude: the amplitude of the wave
 * noiseScale: the degree by which the perlin noise impacts the particles
 * maincolor: the color of the waves
 * subcolor: the color of the noise
 * wavespeed: the speed at which the wave animates
*/
var container, scene, camera, controls, renderer;
var uniforms, mesh;
var time = 0;
var p = [];
var particleCount = 10000;
var particlesGeometry = new THREE.Geometry();
var waveHeights = [];
var waveLength = 80.0;
var waveAmplitude = 90.0;
var noiseScale = 50.0;
var maincolor = new THREE.Color(0x0000FF);
var subcolor = new THREE.Color(0xFFFFFF);
var wavespeed = 1.0;
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	$(window).load
 * Description :	it calls functions to initialize the scene
					it then calls the function to begin rendering
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
$(window).load(function()
{
	/*Reference the html section into which to render the scene*/
	container = document.getElementById("container");
	/*Create the scene to be rendered*/
	scene = new THREE.Scene();
	/*Create, position, and add the camera to the scene*/
	camera = new THREE.PerspectiveCamera(45 , window.innerWidth / window.innerHeight, 0.01, 100000);
	camera.position.set(0, 4000, -4000);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.lookAt(scene.position);
	scene.add(camera);
	/*Create the renderer and initialize the size of the render window*/
	renderer = new THREE.WebGLRenderer({});
	renderer.setSize(window.innerWidth, window.innerHeight);
	/*Add the renderer to the container*/
	container.appendChild(renderer.domElement);
	/*Enable the orbit controls*/
	controls = new THREE.OrbitControls(camera);
	/*generate the cloud of particles to be generated*/
	generateCloud(particleCount);
	/*Initialize the p array for perlin noise generation*/
	p = [];
	for (var i = 0; i < 256; i++) {
		p.push(Math.random()*256);
	}
	/*Create the perlin noise and store the array of values*/
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
			var n = octaveNoise(i/8, j/8, 8);
			n = clamp(n*0.5+0.5,0.0,1.0);
			waveHeights.push(n);
		}
	}
	/*Begin rendering the scene every frame*/
	render();
});
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	$("#particles").change
 * Description :	If the number of particles in the scene to be generated
					changes, regenerate the cloud of particles. 
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
$("#particles").change(function() {
	generateCloud($("#particles").val());
});
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	generateCloud
 * Description :	re-generates the cloud with the given number of
					particles to be drawn in the scene
 * Parameters  :	pnum: the number of particles to be generated
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function generateCloud(pnum)
{
	/*If the user has adjusted the quality of the scene*/
	if (scene.children.length == 2)
	{
		/*Remove all particles from the scene*/
		scene.children.pop();
		/*Create new particle geometry*/
		particlesGeometry = new THREE.Geometry();
	}
	/*Generate particles in the scene based on the given number*/
	for (var p = 0; p < pnum; p++)
	{
		var px, py, pz;
		var vec;
		/*Make sure the particles are generated within a specific region*/
		do
		{
			px = Math.random()* 3000 - 1500;
			py = Math.random()* 200 - 100;
			pz = Math.random()* 3000 - 1500;
		} while(Math.sqrt(px*px+pz*pz) > 1500);
		/*Create a vector position for the given particle*/
		vec = new THREE.Vector3(px, py, pz);
		/*Insert the particle into the cloud*/
		particlesGeometry.vertices.push(vec);
	}
	/*Create the variables necessary for the shader*/
	uniforms = {
		time:				{ type: "f",	value: time},
		waveHeights:		{ type: "fv1",	value: waveHeights},
		waveHeightLength:	{ type: "f",	value: waveHeights.length},
		waveLength:			{ type: "f",	value: waveLength},
		waveAmplitude:		{ type: "f",	value: waveAmplitude},
		noiseScale:			{ type: "f",	value: noiseScale},
		maincolor:			{ type: "c",	value: maincolor},
		subcolor:			{ type: "c",	value: subcolor},
		wavespeed:			{ type: "f",	value: wavespeed}
	};
	/*Create the shader materials, containing the values to be sent to the shader*/
	var shader = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
		transparent: true
	});
	/*Creates the mesh containing the particles and the material to be applied to them*/
	mesh = new THREE.PointCloud(particlesGeometry, shader);
	/*Adds the cloud to the scene*/
	scene.add(mesh);
}
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	render
 * Description :	calls the animation function each frame.
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function render()
{
	requestAnimationFrame(render);
	animation();
	renderer.render(scene, camera);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	animation
 * Description :	called each frame: it sends the necessary values to the
					shaders. Each value sent is based on its sliders.
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function animation()
{
	time++;
	uniforms.time.value = time;
	uniforms.waveLength.value = $('#wavelength').val();
	uniforms.waveAmplitude.value = $('#waveamplitude').val();
	uniforms.noiseScale.value = $('#noisescale').val();
	uniforms.maincolor.value.setRGB($('#c1r').val()/255, $('#c1g').val()/255, $('#c1b').val()/255);
	uniforms.subcolor.value.setRGB($('#c2r').val()/255, $('#c2g').val()/255, $('#c2b').val()/255);
	uniforms.wavespeed.value = $('#wavespeed').val();
}
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	clamp
 * Description :	Returns the given value and keeps it within the given range
 * Parameters  :	x: value to be clamped
					min: the minimum value x can have
					max: the maximum value x can have
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function clamp(x, min, max) {
	return (x < min) ? min : ((max < x) ? max : x);
}
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	octaveNoise
 * Description :	creates the octave perlin noise values for the x,y position
 * Parameters  :	x: the x position on the generated perlin noise "image"
					y: the y position on the generated perlin noise "image"
 * Returns     :	result: the sum noise at the given x,y position for the
					set number of octaves
*/
/* ----------------------------------------------------------------------- */
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
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	noise
 * Description :	creates the perlin noise values for the x,y position
 * Parameters  :	x: the x position on the generated perlin noise "image"
					y: the y position on the generated perlin noise "image"
 * Returns     :	result: the noise at the given x,y position
*/
/* ----------------------------------------------------------------------- */
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
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	fade
 * Description :	Used to create a smoother gradient distribution for the noise
 * Parameters  :	t: 1 dimensional position of a vertex
 * Returns     :	result: returns the smoothed noise value
*/
/* ----------------------------------------------------------------------- */
function fade(t){return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);}
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	lerp
 * Description :	Interpolates the noise given
 * Parameters  :	t: 1 dimensional position of a vertex
 					a: the starting point of interpolation
 					b: the end point of interpolation
 * Returns     :	result: the 1 dimensional position
*/
/* ----------------------------------------------------------------------- */
function lerp(t, a, b){return a + t * (b - a);}
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	grad
 * Description :	Creates the noise gradient
 * Parameters  :	hash: A value used for calculation offsets
 					x: the x position for which to calculate the gradient
 					y: the y position for which to calculate the gradient
 					z: the z position for which to calculate the gradient
 * Returns     :	result: the value of the gradient for the given position
*/
/* ----------------------------------------------------------------------- */
function grad(hash, x, y, z)
{
	var h = hash & 15;
	var u = h < 8.0 ? x : y;
	var v = h < 4.0 ? y : h == 12.0 || h == 14.0 ? x : z;
	return ((h & 1.0) == 0.0 ? u : -u) + ((h & 2.0) == 0.0 ? v : -v);
}