import { Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { AuthService } from "src/services/auth.service";
import { MatFormField, MatLabel, MatError, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton, MatIconButton, MatSuffix, MatIcon]
})
export class LoginComponent implements OnInit {
  router = inject( Router );
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  nourl = false;
  isLoginVisible = true; // Muestra el formulario de inicio de sesión por defecto
  param: string | null = null;
  currentRoute: string | null = null;
  hidePassword: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    // Inicializa el formulario de inicio de sesión
    this.loginForm = this.formBuilder.group({
      cedula: ["", Validators.required],
      contrasena: ["", Validators.required],
    });

    // Inicializa el formulario de registro
    this.registerForm = this.formBuilder.group({
      cedula: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      nombres: ["", Validators.required],
      apellido_paterno: ["", Validators.required],
      apellido_materno: [""],
      contrasena: ["", Validators.required],
    });

    this.currentRoute = this.router.url;

    this.route.queryParams.subscribe((params) => {
      let type = this.handleRouteBasedOnParam();
      if (type === "login") {
        // Capturar todos los parámetros relevantes
        const paramValue = params["param"]; // Captura 'param'
        const tramiteValue = params["tramite"]; // Captura 'tramite' si está presente

        // Construye el valor completo de 'param' con 'tramite' si existe
        this.param = tramiteValue
          ? `${paramValue}&tramite=${tramiteValue}`
          : paramValue;

        this.isLoginVisible = true;
        console.log("param completo:", this.param);
      } else {
        this.param = "";
        this.isLoginVisible = false;
      }
    });
  }

  handleRouteBasedOnParam(): string {
    if (this.currentRoute?.includes("login")) {
      return "login";
    } else if (this.currentRoute?.includes("register")) {
      return "register";
    } else {
      return "auth";
    }
  }

  showRegister(event: Event) {
    event.preventDefault(); // Previene el comportamiento por defecto del enlace
    this.loginForm.reset();
    this.registerForm.reset();
    this.isLoginVisible = false; // Muestra el formulario de registro
  }

  showLogin(event: Event) {
    event.preventDefault(); // Previene el comportamiento por defecto del enlace
    this.loginForm.reset();
    this.registerForm.reset();
    this.isLoginVisible = true; // Muestra el formulario de inicio de sesión
  }

  registerUser() {
    if (this.registerForm.valid) {
      // Obtener los valores del formulario
      const formData = this.registerForm.value;

      // Hacer un trim a los valores del formulario
      const trimmedData = {
        cedula: formData.cedula.trim(),
        nombres: formData.nombres.trim(),
        apellido_paterno: formData.apellido_paterno.trim(),
        apellido_materno: formData.apellido_materno.trim(),
        contrasena: formData.contrasena.trim(),
        email: formData.email.trim(),
      };

      // Guardar los datos en sessionStorage
      sessionStorage.setItem("user", JSON.stringify(trimmedData));

      console.log(
        "Usuario registrado y guardado en sessionStorage:",
        trimmedData
      );

      // Redirigir al usuario a la página de verificación facial
      this.router.navigate(["/face-liveness"]);
    }
  }

  logIn() {
    if (this.loginForm.valid) {
      this.spinner.show();
      const user = this.loginForm.get("cedula")?.value;
      const pass = this.loginForm.get("contrasena")?.value;

      this.authService.login(user.trim(), pass.trim()).subscribe({
        next: (response) => {
          // TODO: loguear al usuario, y ver documentos por firmar
          console.log( { response } );

          // if (this.param) {
          //   console.log("param", this.param);
          //   // Concatenar la URL base con el parámetro
          // const fullUrl = `https://iroclientefirmas.z20.web.core.windows.net/?token=${this.param}`;
          //   // Redirigir al usuario a la URL completa
          //   window.location.href = fullUrl;
          //   this.nourl = false;
          // } else {
          //   this.nourl = true;
          // }
        },
        error: (error) => {
          console.log("error");
          this.snackBar.open(
            "Error al iniciar sesión. Verifique sus credenciales.",
            "Cerrar",
            {
              duration: 5000, // Duración del mensaje en milisegundos
              horizontalPosition: "center",
              verticalPosition: "bottom",
              panelClass: ["error-snackbar"], // Clase para estilos personalizados
            }
          );
        },
        complete() {
          this.spinner.hide();
        },
      });
    }
  }

  navigateToLogin() {
    this.loginForm.reset();
    this.nourl = false;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
