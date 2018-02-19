import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';

import { AuthService } from '../auth.service';
import { SIGNUP_USER_MUTATION, AUTHENTICATE_USER_MUTATION } from '../graphql';
import { Observable } from 'rxjs/Observable';
import { GC_AUTH_TOKEN, GC_USER_ID } from '../constants';

@Component({
  selector: 'hn-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  login: boolean = true; // switch between Login and SignUp
  email: string = '';
  password: string = '';
  name: string = '';

  constructor(
    private authService: AuthService,
    private apollo: Apollo,
    private router: Router
  ) {}

  ngOnInit() {
  }

  confirm() {

    let responseObservable: Observable<any>;

    if (this.login) {
      responseObservable = this.apollo.mutate({
        mutation: AUTHENTICATE_USER_MUTATION,
        variables: {
          email: this.email,
          password: this.password
        }
      });
    } else {
      responseObservable = this.apollo.mutate({
        mutation: SIGNUP_USER_MUTATION,
        variables: {
          name: this.name,
          email: this.email,
          password: this.password
        }
      });
    }

    responseObservable.subscribe((result) => {
      console.log(result);
      const id = result.data.authenticateUser.id;
      const token = result.data.authenticateUser.token;
      this.saveUserData(id, token);

      this.router.navigate(['/']);

    }, (error) => {
      alert(error);
    });
  }

  saveUserData(id, token) {
    localStorage.setItem(GC_USER_ID, id);
    localStorage.setItem(GC_AUTH_TOKEN, token);
    this.authService.setUserId(id);
  }
}
