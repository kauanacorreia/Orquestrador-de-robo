import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Robot, RobotSchema } from '../models/robot.model';

@Injectable({
  providedIn: 'root'
})
export class RobotService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/robots`;

  list(): Observable<Robot[]> {
    return this.http.get<Robot[]>(this.baseUrl);
  }

  get(id: string): Observable<Robot> {
    return this.http.get<Robot>(`${this.baseUrl}/${id}`);
  }

  create(name: string, description: string, schema: RobotSchema): Observable<Robot> {
    return this.http.post<Robot>(this.baseUrl, { name, description, schema });
  }

  newVersion(id: string, schema: RobotSchema): Observable<Robot> {
    return this.http.post<Robot>(`${this.baseUrl}/${id}/new_version`, { schema });
  }

  versions(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/versions`);
  }
}