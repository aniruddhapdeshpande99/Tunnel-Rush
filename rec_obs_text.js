var recObsrotate = 0.0;
var moveRecObs = 0.0;
var jump_acc_RecObs = 0;
var jumped = 0;
var jump_top = 0;
var rot_right = 0;
var rot_left = 0;
var recObsangle = 0.0;
var recObsdist = -128.0;
var statrecObs = 2;
var moveRotRecObs = 0.0;
var greyFlagRecObs = 0;
var finalAngle = 0.0;
var levelrecObs = 1;
var zPos = 0.0;

function initBuffersRecObs(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    -0.25, -4.0,  0.25,
     0.25, -4.0,  0.25,
     0.25,  4.0,  0.25,
    -0.25,  4.0,  0.25,

    // Back face
    -0.25, -4.0, -0.25,
    -0.25,  4.0, -0.25,
     0.25,  4.0, -0.25,
     0.25, -4.0, -0.25,

    // Top face
    -0.25,  4.0, -0.25,
    -0.25,  4.0,  0.25,
     0.25,  4.0,  0.25,
     0.25,  4.0, -0.25,

    // Bottom face
    -0.25, -4.0, -0.25,
     0.25, -4.0, -0.25,
     0.25, -4.0,  0.25,
    -0.25, -4.0,  0.25,

    // Right face
     0.25, -4.0, -0.25,
     0.25,  4.0, -0.25,
     0.25,  4.0,  0.25,
     0.25, -4.0,  0.25,

    // Left face
    -0.25, -4.0, -0.25,
    -0.25, -4.0,  0.25,
    -0.25,  4.0,  0.25,
    -0.25,  4.0, -0.25,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the texture coordinates for the faces.

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

function drawSceneRecObs(gl, programInfo, buffers, texture, deltaTime) {
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
    jump_acc_RecObs -= 0.035;
  }

  if (jump_acc_RecObs <= -1.0) {
    jump_top = 1;
  }

  if (jumped == 1 && jump_top == 1) {
    jump_acc_RecObs += 0.05;
  }

  if (jump_acc_RecObs > 0.0) {
    jump_acc_RecObs = 0.0;
    jumped = 0;
    jump_top = 0;
  }

  if (levelrecObs == 1) {
      moveRecObs+=0.525;
  }
  else if(levelrecObs == 2 || level == 3){
    moveRecObs+=0.725;
  }
  if(moveRecObs>=128){
    moveRecObs=0.0;
    recObsangle = (Math.random() * (0.0 - 90.0) + 90.0)*(Math.PI/180.0);
    recObsdist = (Math.random() * ((-128.0) - (-88.0)) + (-88.0));
    statrecObs = Math.floor(Math.random()*3);
    moveRotRecObs = 0.0;
  }

  if (rot_right) {
      recObsrotate-=Math.PI/128;
  }

  if (rot_left) {
      recObsrotate+=Math.PI/128;
  }

  if (statrecObs == 0) {
    moveRotRecObs += 3*Math.PI/180.0;
  }

  if (statrecObs == 1) {
    moveRotRecObs -= 3*Math.PI/180.0;
  }

  if (statrecObs == 2) {
    moveRotRecObs = 0.0;
  }

  finalAngle = recObsrotate*statrecObs/2 + recObsangle + moveRotRecObs;

  zPos = recObsdist+moveRecObs;

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [0.0, 0.5 + jump_acc_RecObs, recObsdist+moveRecObs]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              finalAngle,     // amount to rotate in radians
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

  // Specify the texture to map onto the faces.

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  if (greyFlagRecObs == 1) {
    gl.uniform1i(programInfo.uniformLocations.grFlag, 1);
  }
  else {
    gl.uniform1i(programInfo.uniformLocations.grFlag, 0);
  }

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  // cubeRotation += deltaTime;
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
      if (greyFlagRecObs == 0) {
        greyFlagRecObs = 1;
      }
      else{
        greyFlagRecObs = 0;
      }
  }
};
