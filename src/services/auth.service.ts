import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrl: string = environment.baseUrl; // Asigna la URL base desde el entorno
  http = inject( HttpClient );

  // Método para login
  login(user: string, pass: string): Observable<any> {
    const url = `${this.baseUrl}/integracion_loginUsuario`;
    const body = {
      cedula: user,
      contrasena: pass,
    };
    return this.http.post(url, body);
  }

  // Método para registro
  register(user: any): Observable<any> {
    const url = `${this.baseUrl}/integracion_registroUsuario`;
    return this.http.post(url, user);
  }
}
