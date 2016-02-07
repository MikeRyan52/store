import {Observable} from 'rxjs/Observable';
import {provide, Injectable} from 'angular2/core';
import {Store, Action, Dispatcher, Reducer, REDUCER, INITIAL_STATE} from './store';
import {liftReducerWith, WrappedState, liftAction} from './instrument';

export const MONITOR_REDUCER = '@@ngrx/devtools/MonitorReducer';

@Injectable()
export class Devtools extends Store<WrappedState>{
  constructor(
    _monitorReducer,
    _dispatcher:Dispatcher<Action>,
    _reducer: (state?: any, action?: Action) => any,
    _initialState: any
  ){
    const reducer = liftReducerWith(_reducer, _initialState, _monitorReducer)
    super(_dispatcher, reducer, reducer(undefined, { type: '@@redux/INIT' }));
  }

  getValue(){
    const state = super.getValue();

    return state.computedStates[state.currentStateIndex].state;
  }

  _getValue(){
    return super.getValue();
  }

  dispatch<T extends Action>(action: T){
    super.dispatch(liftAction(action));
  }

  _dispatch<T extends Action>(action: T){
    super.dispatch(action);
  }

  protected _getMappableState(){
    return this.map(s => s.computedStates[s.currentStateIndex].state);
  }
}

export function useDevtools(monitorReducer = () => null): any[]{
  return [
    provide(MONITOR_REDUCER, {
      useValue: monitorReducer
    }),
    provide(Store, {
      deps: [MONITOR_REDUCER, Dispatcher, REDUCER, INITIAL_STATE],
      useFactory(monitorReducer, dispatcher, reducer, initialState){
        return new Devtools(monitorReducer, dispatcher, reducer, initialState);
      }
    }),
    provide(Devtools, {
      useExisting: Store
    })
  ];
}
