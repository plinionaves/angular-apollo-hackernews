import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';

import { AuthService } from '../auth.service';

@Component({
  selector: 'hn-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  logged = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.isAuthenticated
      .pipe(
        distinctUntilChanged() // Only emit when the current value is different than the last
      ).subscribe((isAuthenticated: boolean) => {
        this.logged = isAuthenticated;
      });
  }

  logout() {
    this.authService.logout();
  }

}
