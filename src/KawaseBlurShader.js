export const KawaseBlurShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'uOffset': { value: null }
  },
  vertexShader: /* glsl 3 */ `
    out vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`,
  fragmentShader: /* glsl 3 */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uOffset;
    in vec2 vUv;
    out vec4 fColor;
    void main() {
      fColor = .25 * (
        texture( tDiffuse, vUv + uOffset )
        + texture( tDiffuse, vUv - uOffset )
        + texture( tDiffuse, vUv + uOffset * vec2( 1., -1. ) )
        + texture( tDiffuse, vUv + uOffset * vec2( -1., 1. ) )
      );
    }
  `
};