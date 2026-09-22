import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Robot,
  RobotSchema,
  RobotEditLog
} from '../models/robot.model';

@Injectable({
  providedIn: 'root'
})
export class RobotService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/robots`;

  /**
   * Lista todos os robôs.
   */
  list(): Observable<Robot[]> {
    return this.http.get<Robot[]>(
      this.baseUrl
    );
  }

  /**
   * Busca um robô pelo ID.
   */
  get(id: string): Observable<Robot> {
    return this.http.get<Robot>(
      `${this.baseUrl}/${id}`
    );
  }

  /**
   * Cadastra um novo robô.
   */
  create(
    name: string,
    description: string,
    department: string,
    schema: RobotSchema
  ): Observable<Robot> {

    return this.http.post<Robot>(
      this.baseUrl,
      {
        name,
        description,
        department,
        schema
      }
    );
  }

  /**
   * Atualiza os dados cadastrais/schema do robô.
   */
  update(
    id: string,
    changes: {
      name?: string;
      description?: string;
      department?: string;
      schema?: RobotSchema;
    },
    userId: string | null
  ): Observable<Robot> {

    return this.http.patch<Robot>(
      `${this.baseUrl}/${id}`,
      {
        ...changes,
        user_id: userId
      }
    );
  }

  /**
   * Alterna entre ativo e inativo.
   */
  toggleStatus(
    id: string,
    userId: string | null
  ): Observable<Robot> {

    return this.http.patch<Robot>(
      `${this.baseUrl}/${id}/toggle_status`,
      {
        user_id: userId
      }
    );
  }

  /**
   * Cria uma nova versão do schema do robô.
   */
  newVersion(
    id: string,
    schema: RobotSchema
  ): Observable<Robot> {

    return this.http.post<Robot>(
      `${this.baseUrl}/${id}/new_version`,
      {
        schema
      }
    );
  }

  /**
   * Consulta versões anteriores do robô.
   */
  versions(
    id: string
  ): Observable<unknown[]> {

    return this.http.get<unknown[]>(
      `${this.baseUrl}/${id}/versions`
    );
  }

  /**
   * Consulta o histórico de alterações.
   */
  editLogs(
    id: string
  ): Observable<RobotEditLog[]> {

    return this.http.get<RobotEditLog[]>(
      `${this.baseUrl}/${id}/edit_logs`
    );
  }
}