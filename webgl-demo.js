var rotate = 0.0;
var octagons=144;
var for_move=0.0;

var jump_acc = 0;
var jumped = 0;
var jump_top = 0;
var rot_right = 0;
var rot_left = 0;

var greyFlag = 0;

var flash = [1.0,1.0,1.0,1.0];
var hue = 1.0;
var flashFlag = 0;
var timer = 0;
var startFlash = 0;
var level = 1;
var score = 0;

var tunnelpos = 0.5;
var yPos = 0.0;

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  var audio = new Audio('./assets/music/TunnelRush.mp3');
  audio.loop = true;
  audio.play();

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    attribute vec4 aColors;
    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
      vColor = aColors;
    }
  `;

  // Fragment shader program

  const fsSource = `
    precision mediump float;

    varying highp vec2 vTextureCoord;
    varying lowp vec4 vColor;

    uniform sampler2D uSampler;
    uniform int grFlag;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord)*vColor;
      if(grFlag!=0) {
        lowp float gray = (0.2*gl_FragColor.r+0.7*gl_FragColor.g+0.07*gl_FragColor.b);
        gl_FragColor = vec4(gray, gray, gray, 1.0);
      }
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aTextureCoord and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      vColor : gl.getUniformLocation(shaderProgram, 'vColor'),
      grFlag : gl.getUniformLocation(shaderProgram, 'grFlag'),
    },
  };



  const vsSource2 = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying lowp vec4 vColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program

  const fsSource2 = `
    varying highp vec2 vTextureCoord;
    varying lowp vec4 vColor;

    uniform sampler2D uSampler;
    uniform int grFlag;


    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
      if(grFlag!=0) {
        lowp float gray = (0.2*gl_FragColor.r+0.7*gl_FragColor.g+0.07*gl_FragColor.b);
        gl_FragColor = vec4(gray, gray, gray, 1.0);
      }
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram2 = initShaderProgram(gl, vsSource2, fsSource2);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aTextureCoord and also
  // look up uniform locations.
  const programInfo2 = {
    program: shaderProgram2,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram2, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram2, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram2, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram2, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram2, 'uSampler'),
      vColor : gl.getUniformLocation(shaderProgram2, 'vColor'),
      grFlag : gl.getUniformLocation(shaderProgram2, 'grFlag'),
    },
  };




  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);
  const buffersRecObs = initBuffersRecObs(gl);

  const texture = loadTexture(gl, './assets/textures/tiles.jpg');
  const redTexture = loadTexture(gl, './assets/textures/red.jpg');
  const test = loadTexture(gl,'./assets/textures/test.jpg');

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    score = Math.round(then);
    timer++;

    if (score >= 20) {
      level = 2;
    }

    if (score >= 25) {
      level = 3;
    }

    if (detect_collisionRecObs()) {
      console.log('1');
    }


    levelrecObs = level;

    // console.log(score);
    // console.log(level);

    document.getElementById('stats').innerHTML = "Level: " + level + "\nScore: "+score;


    if (timer == 400) {
      startFlash = 1;
    }

    if (timer == 700) {
      startFlash = 0;
      flash = [1.0,1.0,1.0,1.0];
      timer = 0;
    }

    if (startFlash) {
      if (hue >= 1.0) {
        flashFlag = 1;
      }

      if (hue < 0.3) {
        hue = 0.3;
        flashFlag = 0;
      }

      if (flashFlag == 1) {
        hue -= 0.05;
      }

      else {
        hue += 0.05;
      }

      for (var z = 0; z < 4; z++) {
        flash[z] = hue;
      }
    }

    drawScene(gl, programInfo, buffers, texture, deltaTime);

    if (greyFlag == 0) {
      drawSceneRecObs(gl, programInfo2, buffersRecObs, redTexture, deltaTime);
    }
    else {
      drawSceneRecObs(gl, programInfo2, buffersRecObs, test, deltaTime);
    }

    // console.log(finalAngle);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  var positions=[];

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  for(var q=0;q<octagons;q++){
    var angle=22.5;
    for(var i=1;i<=8;i++){
        var curr_angle = angle;
        angle+=45.0;
        positions = positions.concat(
          2.0*Math.cos(curr_angle*Math.PI/180.0),
          2.0*Math.sin(curr_angle*Math.PI/180.0),
          1.0-2*q,

          2.0*Math.cos((curr_angle-45)*Math.PI/180.0),
          2.0*Math.sin((curr_angle-45)*Math.PI/180.0),
          1.0-2*q,

          2.0*Math.cos(curr_angle*Math.PI/180.0),
          2.0*Math.sin(curr_angle*Math.PI/180.0),
         -1.0-2*q,

          2.0*Math.cos((curr_angle-45)*Math.PI/180.0),
          2.0*Math.sin((curr_angle-45)*Math.PI/180.0),
         -1.0-2*q
       );
    }
  }

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the texture coordinates for the faces.

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  var textureCoordinates = [];

  yellow = [1.0/3,  0.0,
  1.0/3,  1.0/3,
  2.0/3,  0.0,
  2.0/3,  1.0/3];

  blue = [2.0/3,  0.0,
  2.0/3,  1.0/3,
  3.0/3,  0.0,
  3.0/3,  1.0/3];

  red = [0.0/3,  1.0/3,
  0.0/3,  2.0/3,
  1.0/3,  1.0/3,
  1.0/3,  2.0/3];

  lime = [1.0/3,  1.0/3,
  1.0/3,  2.0/3,
  2.0/3,  1.0/3,
  2.0/3,  2.0/3,];

  purple = [1.0/3,  1.0/3,
  1.0/3,  2.0/3,
  2.0/3,  1.0/3,
  2.0/3,  2.0/3];

  cyan = [0.0/3,  2.0/3,
  0.0/3,  3.0/3,
  1.0/3,  2.0/3,
  1.0/3,  3.0/3];

  green = [1.0/3,  2.0/3,
  1.0/3,  3.0/3,
  2.0/3,  2.0/3,
  2.0/3,  3.0/3];

  orange = [2.0/3,  2.0/3,
  2.0/3,  3.0/3,
  3.0/3,  2.0/3,
  3.0/3,  3.0/3];


  for (var t = 0; t < octagons; t++) {
    for (var x = 0; x < 8; x++) {
      if ((t+x)%8 == 0) {
          textureCoordinates = textureCoordinates.concat(red);
        }
        else if((t+x)%8 == 1){
          textureCoordinates = textureCoordinates.concat(orange);
        }

        else if((t+x)%8 == 2){
          textureCoordinates = textureCoordinates.concat(yellow);
        }

        else if((t+x)%8 == 3){
          textureCoordinates = textureCoordinates.concat(lime);
        }

        else if((t+x)%8 == 4){
          textureCoordinates = textureCoordinates.concat(green);
        }

        else if((t+x)%8 == 5){
          textureCoordinates = textureCoordinates.concat(blue);
        }

        else if((t+x)%8 == 6){
          textureCoordinates = textureCoordinates.concat(cyan);
        }

        else if((t+x)%8 == 7){
          textureCoordinates = textureCoordinates.concat(purple);
        }
    }
  }


  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  var j=0;
  var oct_cnt = 0;
  indices=[];
  var k = 0;
  while(k<octagons){
    oct_cnt = 0;
    while(oct_cnt<8){
      indices = indices.concat(j,j+1,j+2,j+1,j+2,j+3);
      j = j + 4;
      oct_cnt++;
    }
    k++;
  }

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, texture, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  if (jumped == 1 && jump_top == 0) {
    jump_acc -= 0.035;
  }

  if (jump_acc <= -1.0) {
    jump_top = 1;
  }

  if (jumped == 1 && jump_top == 1) {
    jump_acc += 0.05;
  }

  if (jump_acc > 0.0) {
    jump_acc = 0.0;
    jumped = 0;
    jump_top = 0;
  }

  if (level == 1) {
    for_move+=0.525;
  }
  else if(level == 2 || level == 3){
    for_move+=0.725;
  }

  if (level == 3) {
    tunnelpos = -2.0;
  }

  if(for_move>=128)
    for_move=0.0;

  if (rot_right) {
    rotate-=Math.PI/128;
  }

  if (rot_left) {
    rotate+=Math.PI/128;
  }

  yPos = tunnelpos + jump_acc;
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [0.0, tunnelpos + jump_acc, for_move]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              rotate,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);


  var colorLocation = gl.getAttribLocation( programInfo.program, "aColors" );
  gl.vertexAttrib4fv( colorLocation, flash );
  // Specify the texture to map onto the faces.

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  if (greyFlag == 1) {
    gl.uniform1i(programInfo.uniformLocations.grFlag, 1);
  }
  else {
    gl.uniform1i(programInfo.uniformLocations.grFlag, 0);
  }


  {
    const vertexCount = 48*octagons;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

window.onkeydown = function(e) {
  if(parseInt(e.keyCode)==68){
      rot_right = 1;
  }

  if(parseInt(e.keyCode)==65){
      rot_left = 1;
  }

  if(jumped == 0 && parseInt(e.keyCode)==32){
    jumped = 1;
  }

};

window.onkeyup = function(e) {
  if(parseInt(e.keyCode)==68){
      rot_right = 0;
  }
  if(parseInt(e.keyCode)==65){
      rot_left = 0;
  }
  if(parseInt(e.keyCode)==71){
      if (greyFlag == 0) {
        greyFlag = 1;
      }
      else{
        greyFlag = 0;
      }
  }
};

var detect_collisionRecObs = function(){
  if(zPos == 0.0)
  	{
  		var theta = finalAngle - rotate;
  		if(yPos*Math.cos(theta) < 0.3)
  		{
  			return 1;
  		}
  	}
};
