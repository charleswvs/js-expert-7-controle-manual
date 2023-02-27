import Controller from "./controller.js";
import Service from "./service.js";
import View from "./view.js";
import Camera from "../../lib/shared/camera.js";
import { supportsWorkerType } from "../../lib/shared/util.js";

async function getWorker() {
  if (supportsWorkerType()) {
    console.log('supports worker type');
    const worker = new Worker('./src/worker.js', { type: 'module' });
    return worker;
  }
  console.log('does not support worker type');
  console.warn(`Your browser doesn't support esm modules on webworkers!`);
  console.warn(`Importing libraries`);
  await import("https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js")
  await import("https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js")
  await import("https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js")
  await import("https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js")

  console.warn(`using mock worker instead`);

  const service = new Service({ faceLandmarksDetection: window.faceLandmarksDetection });

  const workerMock = {
    async postMessage(video) {
      const blinked = await service.handBlinked(video);
      if (!blinked) return;
      workerMock.onmessage({ data: { blinked } })
    },
    // vai ser sobrescrito pela controller
    onmessage() { },
  }
  console.log('loading TF model');
  await service.loadModel();
  console.log('TF model loaded');

  setTimeout(() => workerMock.onmessage({ data: 'READY' }), 500);
  return workerMock;
}

const worker = await getWorker();
worker.postMessage('hello from video player');
const camera = await Camera.init();


const [rootPath] = window.location.href.split('/pages/')
const factory = {
  async initalize() {
    return Controller.initialize({
      view: new View(),
      worker,
      camera,
    })
  }
}

export default factory