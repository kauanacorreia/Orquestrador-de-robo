import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable,
  from,
  switchMap,
  throwError
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  AccessUser,
  CreateUserPayload,
  UpdatePermissionsPayload
} from '../models/access-user.model';

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  private readonly http =
    inject(HttpClient);

  private readonly authService =
    inject(AuthService);

  private readonly baseUrl =
    `${environment.apiUrl}/v1/users`;

  listUsers():
    Observable<AccessUser[]> {

    return this.withToken(
      token =>
        this.http.get<AccessUser[]>(
          this.baseUrl,
          {
            headers:
              this.authHeaders(token)
          }
        )
    );
  }

  createUser(
    payload: CreateUserPayload
  ): Observable<AccessUser> {

    return this.withToken(
      token =>
        this.http.post<AccessUser>(
          this.baseUrl,
          payload,
          {
            headers:
              this.authHeaders(token)
          }
        )
    );
  }

  updatePermissions(
    userId: string,
    payload: UpdatePermissionsPayload
  ): Observable<AccessUser> {

    return this.withToken(
      token =>
        this.http.patch<AccessUser>(
          `${this.baseUrl}/${userId}/permissions`,
          payload,
          {
            headers:
              this.authHeaders(token)
          }
        )
    );
  }

  toggleStatus(
    userId: string
  ): Observable<AccessUser> {

    return this.withToken(
      token =>
        this.http.patch<AccessUser>(
          `${this.baseUrl}/${userId}/toggle_status`,
          {},
          {
            headers:
              this.authHeaders(token)
          }
        )
    );
  }

  private withToken<T>(
    requestFactory:
      (
        token: string
      ) => Observable<T>
  ): Observable<T> {

    return from(
      this.authService
        .getAccessToken()
    ).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(
            () =>
              new Error(
                'Usuário não autenticado.'
              )
          );
        }

        return requestFactory(
          token
        );
      })
    );
  }

  private authHeaders(
    token: string
  ): HttpHeaders {

    return new HttpHeaders({
      Authorization:
        `Bearer ${token}`
    });
  }
}