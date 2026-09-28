import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, from, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AuthService } from './auth.service';

export type ProfileRole = 'ADMIN' | 'OPERATOR';

export interface CurrentProfile {
  id: string;
  name: string;
  email: string;
  role: ProfileRole;
  status: 'ACTIVE' | 'INACTIVE';
  last_login_at: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/v1/users`;

  private readonly loaded = signal(false);
  readonly currentProfile = signal<CurrentProfile | null>(null);

  readonly isAdmin = computed(
    () => this.currentProfile()?.role === 'ADMIN'
  );

  async loadIfNeeded(): Promise<void> {
    if (this.loaded()) {
      return;
    }

    this.loaded.set(true);

    try {
      const profile = await firstValueFrom(this.me());
      this.currentProfile.set(profile);
    } catch (error) {
      console.error('Não foi possível carregar o perfil do usuário.', error);
    }
  }

  private me(): Observable<CurrentProfile> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('Usuário não autenticado.'));
        }

        return this.http.get<CurrentProfile>(`${this.baseUrl}/me`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        });
      })
    );
  }
}
