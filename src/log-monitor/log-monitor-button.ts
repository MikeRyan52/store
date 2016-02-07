import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter
} from 'angular2/core';

@Component({
  selector: 'log-monitor-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <a class="button" [ngClass]="{ disabled: !enabled }" (click)="handleAction()">
      <ng-content></ng-content>
    </a>
  `,
  styles: [`
    .button {
      font-family: 'monaco, Consolas, Lucida Console, monospace';
      cursor: pointer;
      font-weight: bold;
      border-radius: 3px;
      padding: 4px;
      margin: 5px 3px 5px 3px;
      flex-grow: 1;
      display: inline-block;
      font-size: 0.8em;
      color: white;
      text-decoration: none;
      background-color: #4F5A65;
    }

    .disabled{
      opacity: 0.2;
      cursor: text;
      background-color: transparent;
    }
  `]
})
export class LogMonitorButton{
  @Input() enabled: boolean;
  @Output() action = new EventEmitter();

  handleAction(){
    if(this.enabled){
      this.action.next({});
    }

    return false;
  }
}
