// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// Helpers
import { apiUrl } from '../../shared/config';

// Models
import { User } from '../models';

// Rxjs
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { OpenPgpService } from './openpgp.service';
import { Store } from '@ngrx/store';
import { AppState, Settings } from '../datatypes';
import { LogInSuccess } from '../actions';


declare var openpgp;

@Injectable()
export class UsersService {
  options: any;
  encrypted: any;
  pubkey: any;
  privkey: any;
  passphrase: any;
  privKeyObj: any;

  constructor(
    private http: HttpClient,
    // private mailService: MailService,
    // private sharedService: SharedService,
    private router: Router,
    private openPgpService: OpenPgpService,
    private store: Store<AppState>,
  ) {
    if (this.getToken()) {
      this.store.dispatch(new LogInSuccess({ token: this.getToken() }));
    }
  }

  setTokenExpiration() {
    const expiration = new Date().getTime() + 7 * (1000 * 60 * 60 * 24);
    sessionStorage.setItem('token_expiration', expiration.toString());
  }

  refreshToken(): Observable<any> {
    const body = { token: sessionStorage.getItem('token') };
    const url = `${apiUrl}auth/refresh/`;
    return this.http.post<any>(url, body).pipe(
      tap(data => {
        sessionStorage.setItem('token', data.token);
        this.setTokenExpiration();
      })
    );
  }

  signedIn() {
    const token_active =
      +sessionStorage.getItem('token_expiration') > new Date().getTime();
    if (!!sessionStorage.getItem('token') && token_active) {
      return true;
    } else {
      return false;
    }
  }

  signIn(body): Observable<any> {
    const url = `${apiUrl}auth/sign-in/`;
    return this.http.post<any>(url, body).pipe(
      tap(data => {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user_key', btoa(body.password));
        this.setTokenExpiration();
      })
    );
  }

  signOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_expiration');
    sessionStorage.removeItem('user_key');
    this.router.navigateByUrl('/signin');
  }

  signUp(user): Observable<any> {
    const url = `${apiUrl}auth/sign-up/`;
    const body = {
      recovery_email: user.recovery_email,
      username: user.username,
      password: user.password,
      recaptcha: user.recaptcha
    };
    return this.http.post<any>(url, body);
  }

  verifyToken(): Observable<any> {
    const body = { token: sessionStorage.getItem('token') };
    const url = `${apiUrl}auth/verify/`;
    return this.http.post<any>(url, body);
  }

  getToken(): string {
    return sessionStorage.getItem('token');
  }

  getNecessaryTokenUrl(url) {
    url = url.replace(apiUrl, '');
    const authenticatedUrls: string[] = [
      'users/myself/',
      'users/users/',
      'users/whitelist/',
      'users/blacklist/',
      'users/contact',
      'emails/messages/',
      'emails/mailboxes',
      'users/settings',
      'emails/attachments'
    ];
    if (authenticatedUrls.indexOf(url) > -1) {
      return true;
    } else {
      let authenticated = false;
      authenticatedUrls.forEach(item => {
        if (url.indexOf(item) > -1) {
          authenticated = true;
        }
      });
      return authenticated;
    }
  }

  getAccounts(id) {
    return this.http.get<any>(`${apiUrl}users/users/${id}/`);
  }

  getAccountDetails() {
    return this.http.get<any>(`${apiUrl}users/myself/`).map(data => data['results']);
  }

  getWhiteList(limit = 0, offset = 0) {
    const url = `${apiUrl}users/whitelist/?limit=${limit}&offset=${offset}`;
    const body = {};
    return this.http.get<any>(url, body);
  }

  addWhiteList(email, name) {
    const url = `${apiUrl}users/whitelist/`;
    const body = { email: email, name: name };
    return this.http.post<any>(url, body);
  }

  updateSettings(data: Settings) {
    return this.http.patch<any>(`${apiUrl}users/settings/${data.id}/`, data);
  }

  deleteWhiteList(id) {
    const url = `${apiUrl}users/whitelist/${id}/`;
    const body = {};
    return this.http.delete<any>(url, body);
  }

  getBlackList(limit = 0, offset = 0) {
    const url = `${apiUrl}users/blacklist/?limit=${limit}&offset=${offset}`;
    const body = {};
    return this.http.get<any>(url, body);
  }

  addBlackList(email, name) {
    const url = `${apiUrl}users/blacklist/`;
    const body = { email: email, name: name };
    return this.http.post<any>(url, body);
  }

  deleteBlackList(id) {
    const url = `${apiUrl}users/blacklist/${id}/`;
    const body = {};
    return this.http.delete<any>(url, body);
  }

  getContact(limit = 0, offset = 0) {
    const url = `${apiUrl}users/contacts/?limit=${limit}&offset=${offset}`;
    const body = {};
    return this.http.get<any>(url, body);
  }

  addContact(payload) {
    const url = `${apiUrl}users/contacts/`;
    if (payload.id) {
      return this.http.patch<any>(`${url}${payload.id}/`, payload);
    }
    return this.http.post<any>(url, payload);
  }

  deleteContact(ids) {
    const url = `${apiUrl}users/contacts/?id__in=${ids}`;
    return this.http.delete<any>(url);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
