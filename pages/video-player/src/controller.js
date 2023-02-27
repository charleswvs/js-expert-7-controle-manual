
export default class Controller {
  #view
  #camera
  #worker
  #blinkCount = 0
  #singleBlink = {
    left: 0,
    right: 0,
  }
  constructor({
    view,
    camera,
    worker,
  }) {
    this.#view = view
    this.#camera = camera
    this.#worker = this.#configureWorker(worker);

    this.#view.configureOnBtnStart(this.onBtnStart.bind(this))
  }

  static async initialize(deps) {
    const controller = new Controller(deps)
    controller.log("Not yet detecting eye blick! Please click on the button to start");

    return controller.init()
  }

  #configureWorker(worker) {
    let ready = false;
    worker.onmessage = (msg) => {
      if ('READY' === msg.data) {
        this.#view.enableButton()
        ready = true;
        return;
      }

      const { blinked, rightEyeBlinked, leftEyeBlinked } = msg.data;

      this.#singleBlink.left += leftEyeBlinked ? 1 : 0;
      this.#singleBlink.right += rightEyeBlinked ? 1 : 0;

      if (blinked) {
        this.#view.togglePlayVideo();
        this.#blinkCount += blinked;
      }
    }
    return {
      send(msg) {
        if (!ready) {
          return;
        }
        worker.postMessage(msg);
      }
    }
  }

  async init() {
    console.log('init video player controller')
  }

  loop() {
    const video = this.#camera.video;
    const img = this.#view.getVideoFrame(video);
    this.#worker.send(img);
    this.log('detecting eye blink');

    setTimeout(() => this.loop(), 100);
  }

  log(text) {
    const times = `     - blinked times: ${this.#blinkCount}     - left eye blinked: ${this.#singleBlink.left}     - right eye blinked: ${this.#singleBlink.right}`

    this.#view.log(`logger: ${text}`.concat(this.#blinkCount ? times : ''));
  }

  onBtnStart() {
    this.log('Blink detection initialized')
    this.#blinkCount = 0;
    this.loop();
  }
}