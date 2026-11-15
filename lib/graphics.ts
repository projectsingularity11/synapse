/** Small WebGL helpers shared by the two original, allocation-free visual scenes. */
export function createProgram(
  gl: WebGLRenderingContext,
  vertex: string,
  fragment: string,
) {
  const shaders = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].map((type, i) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, i ? fragment : vertex);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error || "Shader compilation failed");
    }
    return shader;
  });
  const program = gl.createProgram()!;
  shaders.forEach((shader) => gl.attachShader(program, shader));
  gl.linkProgram(program);
  shaders.forEach((shader) => gl.deleteShader(shader));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    throw new Error("Shader linking failed");
  }
  return program;
}
export function softwareGraphics(gl: WebGLRenderingContext) {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return info
    ? /swiftshader|llvmpipe|softpipe|software/i.test(
        String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)),
      )
    : false;
}
