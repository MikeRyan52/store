import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Action, Reducer, StoreCreator, StoreEnhancer} from './interfaces';
import {Store} from './store';
import {liftReducerWith, liftAction, INIT_ACTION} from './instrument';

export interface WrappedState{
  monitorState: any;
  nextActionId: number;
  actionsById: { [id: number]: { action: Action } };
  stagedActionIds: number[];
  skippedActionIds: number[];
  committedState: any;
  currentStateIndex: number;
  computedStates: { state: any, error: any }[];
}

function computeCurrentState({ computedStates, currentStateIndex }: WrappedState){
  return computedStates[currentStateIndex].state;
}

export class LiftedStore extends BehaviorSubject<any>{
  lifted: Store<WrappedState>;
  _reducer: Reducer<any>

  constructor(reducer: Reducer<any>, initialState: any, monitorReducer: Reducer<any>){
    const liftedReducer = liftReducerWith(reducer, initialState, monitorReducer);
    const lifted = new Store<WrappedState>(liftedReducer);

    super(computeCurrentState(lifted.getState()));

    this.lifted = lifted;
    lifted.map(computeCurrentState).subscribe(state => super.next(state));
  }

  select(){
    return this.lifted.select.apply(this, arguments);
  }

  dispatch(action){
    this.lifted.dispatch(liftAction(action));
  }

  next(action){
    this.lifted.next(liftAction(action));
  }

  replaceReducer(reducer){
    this.lifted.replaceReducer(liftReducerWith(reducer));
  }

  getState(){
    return this.value;
  }
}

export function instrument<T>(monitorReducer: Reducer<T> = () => undefined): StoreEnhancer{
  return createStore => (reducer, initialState) => {
    return new LiftedStore(reducer, initialState, monitorReducer);
  }
}
