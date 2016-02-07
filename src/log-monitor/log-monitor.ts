import {Component, ViewEncapsulation, ChangeDetectionStrategy} from 'angular2/core';
import {Observable} from 'rxjs';

import {Devtools} from '../devtools';
import {LogEntryItem} from './log-entry-item';
import {LogMonitorEntry} from './log-monitor-entry';
import {LogMonitorButton} from './log-monitor-button';
import {ActionCreators} from '../instrument';

@Component({
  selector: 'log-monitor',
  directives: [LogMonitorEntry, LogMonitorButton],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      background-color: #2A2F3A;
      font-family: "monaco, Consolas, Lucida Console, monospace";
      position: absolute;
      top: 0;
      right: 0;
      overflow-y: hidden;
      width: 100%;
      height: 100%;
      max-width: 300px;
      direction: ltr;
    }

    .buttonBar{
      text-align: center;
      border-bottom-width: 1;
      border-bottom-style: solid;
      border-color: transparent;
      z-index: 1;
      display: flex;
      flex-direction: row;
    }

    .elements{
      position: absolute;
      left: 0;
      right: 0;
      top: 38;
      bottom: 0;
      overflow-x: hidden;
      overflow-y: auto;
    }
  `],
  template: `
    <log-monitor-button (action)="handleReset()" [enabled]="canReset$ | async">
      Reset
    </log-monitor-button>

    <log-monitor-button (action)="handleRollback()" [enabled]="true">
      Revert
    </log-monitor-button>

    <log-monitor-button (action)="handleSweep()" [enabled]="canSweep$ | async">
      Sweep
    </log-monitor-button>

    <log-monitor-button (action)="handleCommit()" [enabled]="canCommit$ | async">
      Commit
    </log-monitor-button>

    <log-monitor-entry
      *ngFor="#item of (items$ | async)"
      [item]="item"
      (toggle)="handleToggle($event.id)">
    </log-monitor-entry>
  `
})
export class LogMonitor{
  private items$: Observable<LogEntryItem[]>;
  private canRevert$: Observable<boolean>;
  private canSweep$: Observable<boolean>;
  private canCommit$: Observable<boolean>;

  constructor(private devtools: Devtools){
    this.canRevert$ = devtools.map(s => s.computedStates.length > 1);
    this.canRevert$ = devtools.map(s => s.skippedActionIds.length > 0);
    this.canCommit$ = devtools.map(s => s.computedStates.length > 1);

    this.items$ = devtools
      .map(({ actionsById, skippedActionIds, stagedActionIds, computedStates }) => {
        const actions = [];

        for (let i = 0; i < stagedActionIds.length; i++){
          const actionId = stagedActionIds[i];
          const action = actionsById[actionId].action;
          const { state, error } = computedStates[i];
          let previousState;
          if (i > 0) {
            previousState = computedStates[i - 1].state;
          }

          actions.push({
            key: actionId,
            collapsed: skippedActionIds.indexOf(actionId) > -1,
            action,
            actionId,
            state,
            previousState,
            error
          });
        }

        return actions.slice(1);
      });
  }

  handleToggle(id: number){
    this.devtools._dispatch(ActionCreators.toggleAction(id));
  }

  handleReset(){
    this.devtools._dispatch(ActionCreators.reset());
  }

  handleRollback(){
    this.devtools._dispatch(ActionCreators.rollback());
  }

  handleSweep(){
    this.devtools._dispatch(ActionCreators.sweep());
  }

  handleCommit(){
    this.devtools._dispatch(ActionCreators.commit());
  }
}
