import {ContextSide, DataHandler, IDataConverter} from '@dwfe/web-worker';

export abstract class AbstractExchange {
  abstract readonly name: string;
  protected readonly mainSide: ContextSide;

  protected constructor(protected worker: Worker,
                        protected converterMain: IDataConverter,
                        protected handlerMain: DataHandler) {
    // У обмена всегда две контекстные стороны:
    //  - 'worker-side-context' - его представляет воркер
    //  - 'main-side-context'   - ассоциированный с воркером контекст main-контекст, который сейчас надо создать
    this.mainSide = new ContextSide(worker, 'main', converterMain, handlerMain)
  }

  abstract start(): void;

  stop() {
    this.mainSide.stop()
    this.worker.terminate()
  }

  static async buildWorker(pathToChunkListOnServer, entrypoint): Promise<Worker> {
    try {
      // На сервере по пути 'pathToChunkListOnServer' хранится JSON файл.
      // В нем для каждой entrypoint(это те, которые в конфиге webpack'а указываются)
      // перечислены все ее чанки, например:
      //   {
      //     "worker_01": {
      //       "js": [
      //         "worker_01.cf56c35947bd36dc2100.js"
      //       ]
      //     },
      //     "bundle": {
      //       "js": [
      //         "vendors~bundle.a050e0555c37fde16319.js",
      //         "bundle.b86fbd84472582bb0312.js"
      //       ]
      //     }
      //   }
      //
      // Задача:
      //   1) получить этот JSON файл
      //   2) получить из него список чанков воркера
      //   3) из списка получить название конкретного файла, содержащего код воркера
      //   4) создать воркер
      //
      return fetch(pathToChunkListOnServer)
        .then(response => response.json())
        .then(json => json[entrypoint].js[0])
        .then(fileName => new Worker(`./${fileName}`)); // файл воркера лежит на сервере!
    } catch (e) {
      throw new Error(`${this.name}.buildWorker(${entrypoint}, ${pathToChunkListOnServer}), ${e}`)
    }
  }

}
