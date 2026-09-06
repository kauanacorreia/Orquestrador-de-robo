import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  createClient,
  SupabaseClient
} from '@supabase/supabase-js';

import {
  firstValueFrom
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http =
    inject(HttpClient);

  private readonly supabase:
    SupabaseClient;

  constructor() {
    this.supabase =
      createClient(
        environment.supabaseUrl,
        environment.supabaseKey
      );
  }

  async login(
    email: string,
    password: string
  ) {
    const result =
      await this.supabase.auth
        .signInWithPassword({
          email,
          password
        });

    if (
      !result.error &&
      result.data.session
    ) {
      await this.recordLogin(
        result.data.session.access_token
      );
    }

    return result;
  }

  async logout() {
    return await this.supabase.auth
      .signOut();
  }

  async getSession() {
    return await this.supabase.auth
      .getSession();
  }

  async getCurrentUserId():
    Promise<string | null> {

    const { data } =
      await this.supabase.auth
        .getSession();

    return (
      data.session?.user?.id ??
      null
    );
  }

  async getAccessToken():
    Promise<string | null> {

    const { data } =
      await this.supabase.auth
        .getSession();

    return (
      data.session?.access_token ??
      null
    );
  }

  private async recordLogin(
    accessToken: string
  ): Promise<void> {
    try {
      const headers =
        new HttpHeaders({
          Authorization:
            `Bearer ${accessToken}`
        });

      await firstValueFrom(
        this.http.post(
          `${environment.apiUrl}/v1/users/record_login`,
          {},
          { headers }
        )
      );
    } catch (error) {
      console.error(
        'Não foi possível registrar o último login.',
        error
      );
    }
  }
}