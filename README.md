# About

Kawase blur pass for threejs postprocessing. 

[Live example](https://ycw.github.io/three-kawase-blur/example/)



## Installation

via cdn

https://cdn.jsdelivr.net/gh/ycw/three-kawase-blur@{VERSION}/src/index.js

via npm

`$ npm i ycw/three-kawase-blur` or

`$ npm i ycw/three-kawase-blur#{VERSION_TAG}`



## Usage

```js
import * as THREE from '//path/to/three.js'
import { EffectComposer, Pass, FullScreenQuad } from '//path/to/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '//path/to/jsm/postprocessing/RenderPass.js'
import { CopyShader } from '//path/to/jsm/shaders/CopyShader.js'
import { KawaseBlurPassGen } from '//path/to/three-kawase-blur'

...

// Generate KawaseBlurPass class
const KawaseBlurPass = KawaseBlurPassGen({
  THREE, EffectComposer, Pass, FullScreenQuad, CopyShader
}); 

// Create KawaseBlurPass instance
const myKawaseBlurPass = new KawaseBlurPass({ 
  renderer, kernels: [0, 1, 2, 2, 3] 
});

// Add to EffectComposer 
const fx = new EffectComposer(renderer);
fx.addPass(new RenderPass(scene, camera));
fx.addPass(myKawaseBlurPass);
```



## Credits

[mrdoob / three.js](https://github.com/mrdoob/three.js/)

[Intel / An investigation of fast real-time GPU-based image blur algorithms](https://software.intel.com/content/www/us/en/develop/blogs/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms.html)



## License

[MIT](./LICENSE)