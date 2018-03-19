import { Component, OnInit } from '@angular/core';
import * as myGlobals from './../global';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  selecttab: any = 1;
  url: any;

  public base_url: any = myGlobals.base_url;

  constructor() {
    const url = window.location.href;
    const curl = url.split('/');
    this.url = curl[3];
  }

  ngOnInit() {
  }

}
