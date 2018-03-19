import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  showHeader: any;
  public location = '';

  constructor(private router: Router) {
  }

  ngOnInit() {
    // listenging to routing navigation event
    this.router.events.subscribe(event => this.modifyHeader(event));
  }

  modifyHeader(location) {
    if (location.url === '/login' || location.url === '/signup' || location.url === '/list') {
      this.showHeader = false;
    } else {
      this.showHeader = true;
    }
  }
}
