import { KawaseBlurShader } from './KawaseBlurShader.js'

export function KawaseBlurPassGen({ THREE, EffectComposer, Pass, FullScreenQuad }) {

  class InternalKawaseBlurPass extends Pass {
    constructor(uOffset) {
      super();

      const uniforms = THREE.UniformsUtils.clone(KawaseBlurShader.uniforms);
      uniforms.uOffset.value = uOffset;

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: KawaseBlurShader.vertexShader,
        fragmentShader: KawaseBlurShader.fragmentShader,
      });

      this.fsQuad = new FullScreenQuad(material);
      this.uniforms = material.uniforms;
      this.shouldRenderToSreen = false;
    }

    render(renderer, writeBuffer, readBuffer) {
      this.uniforms['tDiffuse'].value = readBuffer.texture;

      if (this.shouldRenderToSreen) {
        renderer.setRenderTarget(null);
      } else {
        renderer.setRenderTarget(writeBuffer);
        if (this.clear) renderer.clear();
      }
      this.fsQuad.render(renderer);
    }

  }

  // expose
  return class KawaseBlurPass extends Pass {

    constructor({ renderer, kernels = [0, 1] }) {
      super();
      this._kernels = kernels;
      this._renderer = renderer;
      this._internalComposer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(0, 0));
      this.setKernels(kernels);
    }

    getKernels() {
      return Array.from(this._kernels);
    }

    setKernels(kernels) {
      const res = this._renderer.getDrawingBufferSize(new THREE.Vector2());

      for (const [i, k] of kernels.entries()) {
        const uOffset = new THREE.Vector2().setScalar(.5 + k).divide(res);
        const pass = this._internalComposer.passes[i];
        if (pass) { // reuse
          pass.uniforms.uOffset.value = uOffset;
          pass.shouldRenderToSreen = false;
        } else {
          this._internalComposer.addPass(new InternalKawaseBlurPass(uOffset));
        }
      }

      this._internalComposer.passes.length = kernels.length; // rm unused
      this._internalComposer.reset();
      this._kernels = Array.from(kernels);
    }

    render(renderer, writeBuffer, readBuffer) {
      if (this._kernels.length === 0) return;
      // ---- transfer ownership
      this._internalComposer.readBuffer = readBuffer;
      this._internalComposer.writeBuffer = writeBuffer;
      this._internalComposer.passes[this._internalComposer.passes.length - 1].shouldRenderToSreen = this.renderToScreen; 
      this._internalComposer.render(renderer);
    }

    setSize(w, h) {
      this._internalComposer.setSize(w, h);
      this.setKernels(this._kernels);
    }

  };
}
