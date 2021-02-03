import {WorkerActions} from './worker.actions';

WorkerActions
  .of('02')
  .then(actions => actions.run());

