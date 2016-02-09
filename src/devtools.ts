import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Action, Reducer, StoreCreator, StoreEnhancer} from './interfaces';
import {Store} from './store';
import {liftReducerWith, liftAction, unliftState, WrappedState} from './instrument';

export class InstrumentedStore extends BehaviorSubject<any>{
  _reducer: Reducer<any>

  constructor(public lifted: Store<WrappedState>){
    super(unliftState(lifted.getState()));

    lifted.map(unliftState).subscribe(state => super.next(state));
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
    const liftedReducer = liftReducerWith(reducer, initialState, monitorReducer);
    const lifted = createStore(liftedReducer);
    return new InstrumentedStore(lifted);
  }
}
