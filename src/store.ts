import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {provide} from 'angular2/core';
import {Operator} from 'rxjs/Operator';

//store specific operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/zip-static';

export interface Action {
  type: string;
}

export interface Reducer<T> {
  (state: T, action: Action): T;
}

export const REDUCER = '@@ngrx/Reducer';
export const INITIAL_STATE = '@@ngrx/InitialState';

export class Store<T> extends BehaviorSubject<T> {
  private _storeSubscription: Subscription<T>;

	constructor(
    private _dispatcher: Dispatcher<Action>,
    private _reducer: (state?: T, action?: Action) => T,
    initialState: T
  ) {
    super(initialState);
    let rootReducer = this._dispatcher.scan(_reducer, initialState);
    this._storeSubscription = rootReducer.subscribe(this);
	}

  // Helper method for devtools
  protected _getMappableState(): Observable<any>{
    return this;
  }

  select<R>(keyOrSelector: ((state: T) => R) | string | number | symbol): Observable<R> {
    if (
      typeof keyOrSelector === 'string' ||
      typeof keyOrSelector === 'number' ||
      typeof keyOrSelector === 'symbol'
    ) {
      return this._getMappableState().map(state => state[keyOrSelector]).distinctUntilChanged();
    }
    else if (typeof keyOrSelector === 'function') {
      return this._getMappableState().map(keyOrSelector).distinctUntilChanged();
    }
    else {
      throw new TypeError(
        `Store@select Unknown Parameter Type: `
        + `Expected type of function or valid key type, got ${typeof keyOrSelector}`
      );
    }
  }

  dispatch<T extends Action>(action: T): void {
    this._dispatcher.next(action);
  }

  createAction(type: string): (payload?: any) => void {
    return (payload?: any) => {
      this.dispatch({ type, payload });
    };
  }
}

export class Dispatcher<Action> extends Subject<Action> {
  dispatch(action: Action): void {
    this.next(action);
  }
}

export function provideStore<T>(reducer: (state?: T, action?: Action) => T, initialState?: T): any[]{
  return [
    Dispatcher,
    provide(REDUCER, {
      useValue: reducer
    }),
    provide(INITIAL_STATE, {
      useValue: initialState || reducer(undefined, { type: '@@ngrx/init' })
    }),
    provide(Store, {
      deps: [Dispatcher, REDUCER, INITIAL_STATE],
      useFactory: (dispatcher, reducer, initialState) => {
        return new Store(dispatcher, reducer, initialState);
      }
    })
  ];
};
