import {BaseHandler} from '@dwfe/web-worker';

export class WorkerHandler extends BaseHandler {

  process(data) {
    console.log(`worker process`, data)
    this.send({...data, time: +new Date()})
  }

}
