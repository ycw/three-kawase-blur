import { KawaseBlurShader } from './KawaseBlurShader.js'

export function KawaseBlurPassGen({ THREE, EffectComposer, Pass, FullScreenQuad, CopyShader }) {

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
    }

    render(renderer, writeBuffer, readBuffer) {
      this.uniforms['tDiffuse'].value = readBuffer.texture;
      renderer.setRenderTarget(writeBuffer);
      this.fsQuad.render(renderer);
    }

  }

  // expose
  return class KawaseBlurPass extends Pass {

    constructor({ renderer, kernels = [0, 1] }) {
      super();
      this.kernels = kernels;
      this.renderer = renderer;

      this.internalComposer = new EffectComposer(renderer);
      this.setKernels(kernels);

      this.fsQuad = new FullScreenQuad(new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(CopyShader.uniforms), 
        vertexShader: CopyShader.vertexShader,
        fragmentShader: CopyShader.fragmentShader
      }));
    }

    setKernels(kernels) {
      const res = this.renderer.getDrawingBufferSize(new THREE.Vector2());

      for (const [i, k] of kernels.entries()) {
        const uOffset = new THREE.Vector2().setScalar(.5 + k).divide(res);
        const pass = this.internalComposer.passes[i];
        if (pass) { // reuse 
          pass.uniforms.uOffset.value = uOffset;
        } else {
          this.internalComposer.addPass(new InternalKawaseBlurPass(uOffset));
        }
        this.kernels[i] = k;
      }

      this.internalComposer.passes.length = kernels.length;
      this.internalComposer.reset();
      this.kernels.length = kernels.length;
    }

    render(renderer, writeBuffer, readBuffer) {
      this.internalComposer.readBuffer = readBuffer;
      this.internalComposer.render(renderer);

      if (this.renderToScreen) {
        this.renderer.setRenderTarget(null);
      } else {
        this.renderer.setRenderTarget(writeBuffer);
        if (this.clear) renderer.clear();
      }
      this.fsQuad.material.uniforms['tDiffuse'].value = this.internalComposer.readBuffer.texture;
      this.fsQuad.render(renderer);
    }

    setSize(w, h) {
      this.internalComposer.setSize(w, h);
      this.setKernels(this.kernels);
    }

  };
}
