import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'nAngular';
  primeNo;
  constructor() {
    this.registerWebWorker();
  }

  registerWebWorker(){
    const worker = new Worker('./bgworker.worker', { type: 'module' });
    worker.onmessage = ({ data }) => {
      this.primeNo = data;
    };
    worker.postMessage(231);
  }
}
