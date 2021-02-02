import {BaseHandler} from '@dwfe/web-worker';

export class MainHandler extends BaseHandler {

  process(data) {
    console.log(`main process`, data)
  }

}
