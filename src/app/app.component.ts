import { Component, OnInit } from '@angular/core';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  // 1
  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    // 2
    this.authService.autoLogin();
  }
}
