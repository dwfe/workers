import {WorkerActions} from './worker.actions';

WorkerActions
  .of('01')
  .then(actions => actions.run());

