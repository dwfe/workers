import {exchanges} from './src/exchanges/side.factory';
import {MainActions} from './src/exchanges/main/main.actions';

Array
  .from(exchanges.keys())
  .forEach(async id => {
      const actions = await MainActions.of(id);
      actions.run();
    }
  )
