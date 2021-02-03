import {StructuredCloneConverter} from '@dwfe/web-worker';
import {Exchange} from './exchange';
import {TExchangeData} from './contarct';

export const registry = new Map<string, TExchangeData>([
  ['01', {mainConverter: new StructuredCloneConverter(), workerConverter: new StructuredCloneConverter()}]
]);

export class ExchangeFactory {

  static async get(id: string): Promise<Exchange> {
    if (!registry.has(id))
      throw new Error(`unknown exchange '${id}'`);
    const worker = await buildWorker(id);
    const {mainConverter} = registry.get(id) as TExchangeData;
    return new Exchange(id, mainConverter, worker);
  }

}

/**
 * На сервере хранится JSON файл.
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
const buildWorker = (id: string): Promise<Worker> => {
  const entrypoint = `worker_${id}`;
  return fetch('./chunk_list_by_entrypoint.json')  // 1) получить JSON файл с информацией обо всех чанках
    .then(response => response.json())             // 2) получить из него список чанков воркера
    .then(json => json[entrypoint].js[0])          // 3) получить название конкретного файла, содержащего код воркера
    .then(fileName => new Worker(`./${fileName}`)) // 4) создать воркер. Файл воркера лежит на сервере!
}
