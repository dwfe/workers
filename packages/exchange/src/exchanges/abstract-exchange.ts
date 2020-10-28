import {ContextSide, DataHandler, IDataConverter} from '@dwfe/test-workers-core';

export abstract class AbstractExchange {
  abstract readonly name: string;
  protected readonly mainSide: ContextSide;

  protected constructor(protected worker: Worker,
                        protected converterMain: IDataConverter,
                        protected handlerMain: DataHandler) {
    // У обмена всегда две контекстные стороны:
    //  - 'worker-side-context' - его представляет воркер
    //  - 'main-side-context'   - ассоциированный с воркером объект mainSide, который сейчас надо создать
    this.mainSide = new ContextSide(worker, 'main', converterMain, handlerMain)
  }

  abstract start(): void;

  stop() {
    this.mainSide.stop()
    this.worker.terminate()
  }

  static async buildWorker(entrypoint, workerFilePattern, pathToChunkListJsonOnServer): Promise<Worker> {
    try {
      // На сервере по пути 'pathToChunkListJsonOnServer' хранится JSON файл.
      // В нем для каждой entrypoint(это те, которые в конфиге webpack'а указываются)
      // перечислены все принадлежащие ей чанки, например:
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
      //   2) получить из него список чанков(файлов) для entrypoint, который использовался при компиляции воркера
      //   3) из списка получить название конкретного файла, куда был скомпилирован код воркера
      //   4) создать воркер
      //
      const fileName = await fetch(pathToChunkListJsonOnServer)
        .then(async response => await response.json().then(json =>
          json[entrypoint].js.find(chunk => chunk.includes(workerFilePattern))
        ))
      return new Worker(`./${fileName}`) // путь, где лежит файл воркера на сервере!
    } catch (e) {
      throw new Error(`${this.name}.buildWorker(${entrypoint}, ${pathToChunkListJsonOnServer}), ${e}`)
    }
  }

}
