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
    const worker = new Worker('./bgworker.worker', { type: 'module' });
    worker.onmessage = ({ data }) => {
      this.primeNo = data;
    };
    worker.postMessage(231);


    navigator.serviceWorker.register('service-worker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  }
}
