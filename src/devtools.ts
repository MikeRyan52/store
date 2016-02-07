import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {provide, Injectable} from 'angular2/core';
import {Store, StoreAccessor, Selector, Action, Dispatcher, Reducer, REDUCER, INITIAL_STATE} from './store';
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

  computeState({ computedStates, currentStateIndex }: WrappedState){
    return computedStates[currentStateIndex].state;
  }

  selectComputedState(selector: Selector<WrappedState, any>){
    return this._select(this.map(s => this.computeState(s)), selector);
  }
}

@Injectable()
class LiftedStore extends BehaviorSubject<any> implements StoreAccessor<any>{
  constructor(private devtools: Devtools){
    super(devtools.computeState(devtools.getValue()))
    devtools.map(s => devtools.computeState(s)).subscribe(this);
  }

  dispatch(action){
    this.devtools.dispatch(liftAction(action));
  }

  select(selector: Selector<any,any>): Observable<any>{
    return this.devtools.selectComputedState(selector);
  }

  createAction(type: string){
    return (payload?: any) => {
      this.devtools.dispatch(liftAction({ type, payload }));
    }
  }
}

export function useDevtools(monitorReducer = () => null): any[]{
  return [
    provide(MONITOR_REDUCER, {
      useValue: monitorReducer
    }),
    provide(Store, {
      useClass: LiftedStore
    }),
    provide(Devtools, {
      deps: [MONITOR_REDUCER, Dispatcher, REDUCER, INITIAL_STATE],
      useFactory(monitorReducer, dispatcher, reducer, initialState){
        return new Devtools(monitorReducer, dispatcher, reducer, initialState);
      }
    })
  ];
}
