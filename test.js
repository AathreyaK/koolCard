// Aathreya Kadambi
// koolCard

var gl;
var img;

function makeBuffer(data, type, drawType = gl.STATIC_DRAW) {
    var bufferObject = gl.createBuffer();
    gl.bindBuffer(type, bufferObject);
    if (type == gl.ARRAY_BUFFER)
        gl.bufferData(type, new Float32Array(data), drawType);
    else if (type == gl.ELEMENT_ARRAY_BUFFER)
        gl.bufferData(type, new Uint16Array(data), drawType);
    else
        console.err('ERROR: The makeBuffer function (webgllib.js) is not built to support the type ' + type + ' yet!');
    return bufferObject;
}

function sendToShader(bufferObject, type, program, name, size, stride, offset, datatype, normalized = gl.FALSE) {
    gl.bindBuffer(type, bufferObject);
    var attribLoc = gl.getAttribLocation(program, name);
    gl.vertexAttribPointer(
        attribLoc,
        size,
        datatype,
        normalized,
        stride,
        offset
    );
    gl.enableVertexAttribArray(attribLoc);
    return attribLoc;
}

var loadTXT = function (url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status < 200 || request.status > 299) {
            callback('ERROR: HTTP Status ' + request.status + " on resource " + url);
        } else {
            callback(null, request.responseText);
        }
    };
    request.send();
};

var loadIMG = function (url, callback) {
    var image = new Image();
    image.onload = function () {
        callback(null, image);
    };
    image.src = url;
};

function resize(canvas) {
    var realToCSSPixels = window.devicePixelRatio;

    var width = Math.floor(canvas.clientWidth * realToCSSPixels);
    var height = Math.floor(canvas.clientHeight * realToCSSPixels);
    if (canvas.width != width || canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

var init = (function () {
    loadTXT('/shader.vs.glsl', function (vsErr, vsText) {
        if (vsErr) {
            alert('Fatal error loading vertex shader! See the console!');
            console.log(vsErr);
        } else {
            loadTXT('/shader.fs.glsl', function (fsErr, fsText) {
                if (fsErr) {
                    alert('Fatal error loading fragment shader! See the console!');
                    console.log(fsErr);
                } else { 
                    loadIMG('combinedflame.jpg', function (imgErr, img) {
                        if (imgErr) {
                            alert('Fatal error loading BlueFlame.png! See the console!');
                            console.log(imgErr);
                        } else {
                            main(vsText, fsText, img);
                        }
                    });
                }
            });
        }
    });
})();

var main = function (vertexShaderText, fragmentShaderText, imgObj) {
    console.log('hi')
    img = imgObj;

    var canvas = document.getElementById('test');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL wasn\'t supported!');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    resize(gl.canvas);
    gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    var vertices =
        [ // X, Y, Z           U, V     N
            1.0, 1.0, 0.0, 0.5, 1.0, 0.0, 0.0, 1.0,
            1.0, -1.0, 0.0, 0.5, 0, 0.0, 0.0, 1.0,
            -1.0, -1.0, 0.0, 0, 0, 0.0, 0.0, 1.0,
            -1.0, 1.0, 0.0, 0, 1.0, 0.0, 0.0, 1.0,

            -1.0, 1.0, 0.01, 0.5, 1.0, 1.0, 0.0, 1.0,
            -1.0, -1.0, 0.01, 0.5, 0, 1.0, 0.0, 1.0,
            1.0, -1.0, 0.01, 1.0, 0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.01, 1.0, 1.0, 1.0, 0.0, 1.0
        ];

    var indices =
        [
            0, 1, 2,
            0, 2, 3,
            4, 5, 6,
            4, 6, 7
        ];

    var VBO = makeBuffer(vertices, gl.ARRAY_BUFFER); // Vertex Buffer Object
    var IBO = makeBuffer(indices, gl.ELEMENT_ARRAY_BUFFER); // Texture Coordinates Buffer Object

    sendToShader(VBO, gl.ARRAY_BUFFER, program, 'vertPosition', 3, 8 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT, gl.FLOAT);
    sendToShader(VBO, gl.ARRAY_BUFFER, program, 'vertTexCoord', 2, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT, gl.FLOAT);
    sendToShader(VBO, gl.ARRAY_BUFFER, program, 'vertNormal', 3, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT, gl.FLOAT);

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.useProgram(program);
    
    var m_worldUniLoc = gl.getUniformLocation(program, 'm_world');
    var m_viewUniLoc = gl.getUniformLocation(program, 'm_view');
    var m_projUniLoc = gl.getUniformLocation(program, 'm_proj');

    var m_world = new Float32Array(16);
    var m_view = new Float32Array(16);
    var m_proj = new Float32Array(16);
    glMatrix.mat4.identity(m_world);
    glMatrix.mat4.lookAt(m_view, [0,0,-2.6], [0,0,0], [0,1,0]);
    glMatrix.mat4.perspective(m_proj, Math.PI/3, canvas.width/canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(m_worldUniLoc, gl.FALSE, m_world);
    gl.uniformMatrix4fv(m_viewUniLoc, gl.FALSE, m_view);
    gl.uniformMatrix4fv(m_projUniLoc, gl.FALSE, m_proj);

    var m_xRot = new Float32Array(16);
    var m_yRot = new Float32Array(16);

    var ambientUniLoc = gl.getUniformLocation(program, 'ambientLight');
    var sunDirUniLoc = gl.getUniformLocation(program, 'sun.direction');
    var sunColUniLoc = gl.getUniformLocation(program, 'sun.color');
    var lightPosUniLoc = gl.getUniformLocation(program, 'lightPos');
    var cameraPosUniLoc = gl.getUniformLocation(program, 'cameraPos');

    gl.uniform3f(ambientUniLoc, 0.4, 0.4, 0.4);
    gl.uniform3f(sunDirUniLoc, 1.0, 4.0, -1.0);
    gl.uniform3f(sunColUniLoc, 1.0, 0.9, 1.0);
    gl.uniform3f(lightPosUniLoc, 0.0, 0.0, 0.0);
    gl.uniform3f(cameraPosUniLoc, 0.0, 1.0, -2.5);

    var m_identity = new Float32Array(16);
    glMatrix.mat4.identity(m_identity);
    var angle = 0;
    var loop = function () {

        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        glMatrix.mat4.rotate(m_yRot, m_identity, angle / 2, [0, 1, 0]);
        glMatrix.mat4.rotate(m_xRot, m_identity, 0, [1, 0, 0]);
        glMatrix.mat4.mul(m_world, m_yRot, m_xRot);
        gl.uniformMatrix4fv(m_worldUniLoc, gl.FALSE, m_world);

        resize(gl.canvas);
        gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    
};