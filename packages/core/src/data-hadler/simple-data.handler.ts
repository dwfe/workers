import {Observable, Subject} from 'rxjs';
import {IWorkerDataHandler, IWorkerPostData} from './contract';

export class SimpleDataHandler implements IWorkerDataHandler {
  private postSubj = new Subject<IWorkerPostData>();

  post(data: IWorkerPostData): void {
    this.postSubj.next(data);
  }

  post$: Observable<IWorkerPostData> = this.postSubj.asObservable();

  process(data) {
  }
}
