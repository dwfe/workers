import {ContextSide, IConverter} from '@dwfe/web-worker';

export abstract class AbstractExchange {
  abstract readonly name: string;
  protected readonly mainSide: ContextSide;

  protected constructor(protected worker: Worker,
                        protected mainConverter: IConverter) {
    // У обмена всегда две контекстные стороны:
    //  - 'worker-side-context' - его представляет воркер
    //  - 'main-side-context'   - ассоциированный с воркером контекст main-контекст, который сейчас надо создать
    this.mainSide = new ContextSide(worker, 'main', mainConverter)
    this.mainSide.setDebug(true);
  }

  abstract start(): void;

  stop() {
    this.mainSide.stop()
  }

  /**
   * На сервере по пути 'pathToChunkListOnServer' хранится JSON файл.
   * В нем для каждой entrypoint(это те, которые в конфиге webpack'а указываются)
   * перечислены все приндалежащие ей чанки, например:
   *   {
   *     "bundle": {
   *       "js": [
   *         "vendors~bundle.a050e0555c37fde16319.js",
   *         "bundle.b86fbd84472582bb0312.js"
   *       ]
   *     },
   *     "worker_01": {
   *       "js": [
   *         "worker_01.cf56c35947bd36dc2100.js"
   *       ]
   *     }
   *   }
   */
  static buildWorker = (pathToChunkListOnServer, entrypoint): Promise<Worker> =>
    fetch(pathToChunkListOnServer)                   // 1) получить JSON файл с информацией обо всех чанках
      .then(response => response.json())             // 2) получить из него список чанков воркера
      .then(json => json[entrypoint].js[0])          // 3) получить название конкретного файла, содержащего код воркера
      .then(fileName => new Worker(`./${fileName}`)) // 4) создать воркер. Файл воркера лежит на сервере!
      .catch(e => {
        throw new Error(`buildWorker(${entrypoint}, ${pathToChunkListOnServer}), ${e}`);
      })
  ;

}
