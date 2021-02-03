import {ContextSide, StructuredCloneConverter} from '@dwfe/web-worker';
import {TSide, TSideData} from './contract';

export const exchanges = new Map<string, TSideData>([
  ['01', {converter: {main: new StructuredCloneConverter(), worker: new StructuredCloneConverter()}}]
]);

export class SideFactory {

  static async get(side: TSide, id: string): Promise<ContextSide> {
    if (!exchanges.has(id))
      throw new Error(`unknown exchange '${id}'`);

    let ctx: ContextSide;
    const {converter} = exchanges.get(id) as TSideData;

    switch (side) {
      case 'main':
        const worker = await buildWorker(id);
        ctx = new ContextSide(side, worker, converter.main)
        break;
      case 'worker':
        ctx = new ContextSide(side, self, converter.worker);
        break;
      default:
        throw new Error(`unknown side '${side}'`);
    }
    ctx.setDebug(true);
    return ctx;
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
