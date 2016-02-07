import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  HostListener
} from 'angular2/core';

import {LogEntryItem} from './log-entry-item';

@Component({
  selector: 'log-monitor-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="action-bar" [ngClass]="{ collapsed: item.collapsed }">
      {{ item.action.type }}
    </div>
    <div class="action-bar" *ngIf="!item.collapsed">
      <button (click)="logPayload($event)">Log Payload</button>
      <button (click)="logState($event)">Log State</button>
    </div>
  `,
  styles: [`
    :host{
      color: #FFFFFF;
      background-color: #4F5A65;
    }
    .action-bar{
      padding: 8px 0 7px 16px;
    }
    .collapsed{
      text-decoration: line-through;
      font-style: italic;
      opacity: 0.5;
    }
  `]
})
export class LogMonitorEntry{
  @Input() item: LogEntryItem;
  @Output() toggle = new EventEmitter();

  @HostListener('click') handleToggle(){
    this.toggle.next({ id: this.item.actionId });
  }

  logPayload($event: Event){
    console.log(this.item.action);

    event.stopPropagation();
  }

  logState($event: Event){
    console.log(this.item.state);

    event.stopPropagation();
  }
}
