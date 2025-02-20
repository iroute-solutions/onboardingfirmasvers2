import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { LivenessService } from "./liveness.service";
import * as AWS from "aws-sdk";
import { FaceLivenessReactWrapperComponent } from "src/FaceLivenessReactWrapperComponent";
import awsmobile from "src/aws-exports";
import { Amplify } from "aws-amplify";
import * as CryptoJS from "crypto-js";
import { Router } from "@angular/router";
import { NgxSpinnerService, NgxSpinnerComponent } from "ngx-spinner";
import { AuthService } from "src/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

import { FaceLivenessReactWrapperComponent as FaceLivenessReactWrapperComponent_1 } from "../../FaceLivenessReactWrapperComponent";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: "app-face-liveness",
    templateUrl: "./face-liveness.component.html",
    styleUrls: ["./face-liveness.component.scss"],
    encapsulation: ViewEncapsulation.None,
    imports: [NgxSpinnerComponent, FaceLivenessReactWrapperComponent_1, MatIcon]
})
export class FaceLivenessComponent implements OnInit {
  public counter = 21;

  start_liveness_session = false;
  liveness_session_complete = false;
  nombreUsuario = "";
  session_id = null;
  is_live = false;
  confidence = 0;
  face_live_message = "Cargando...";

  @ViewChild("faceliveness", { static: false })
  faceliveness: FaceLivenessReactWrapperComponent;
  completoRegistro: boolean = false;
  ocurrioError: boolean = false;
  router = inject( Router );
  authService = inject( AuthService );
  faceLivenessService = inject( LivenessService );

  constructor(
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.ocurrioError = false;
    this.spinner.show();
    // Recupera los datos del sessionStorage
    const userData = sessionStorage.getItem("user");

    if (userData) {
      const user = JSON.parse(userData);

      // Extrae el nombre y los apellidos
      const nombres = user.nombres || "";
      const apellido_paterno = user.apellido_paterno || "";
      const apellido_materno = user.apellido_materno || "";

      // Concatenar el nombre y los apellidos
      this.nombreUsuario = `${nombres} ${apellido_paterno} ${apellido_materno}`;

      console.log("Nombre de usuario:", this.nombreUsuario);
    } else {
      console.warn("No se encontraron datos de usuario en sessionStorage");
    }

    this.faceLivenessService.liveness_session.subscribe(([status, data]) => {
      if (status === "success") {
        this.initate_liveness_session(data);
      }
    });

    AWS.config.region = awsmobile["aws_project_region"];
    const cognito_endpoint = `cognito-idp.${awsmobile["aws_project_region"]}.amazonaws.com/${awsmobile["aws_user_pools_id"]}`;

    // Obtén la información del usuario (reemplaza 'usuario_creado' y 'contraseña_del_usuario')
    const username = "bryan.tacuri@iroute.com.ec";
    const password = "BMbetairoute9";

    // Inicia sesión automáticamente
    Amplify.Auth.signIn(username, password)
    .then((user) => {
      console.log("Inicio de sesión automático exitoso", user);

      // Verifica si la sesión del usuario es válida y contiene el token de identificación
      if (user.signInUserSession && user.signInUserSession.getIdToken()) {
        // Configura las credenciales de AWS Cognito
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: awsmobile["aws_cognito_identity_pool_id"],
          Logins: {
            [cognito_endpoint]: user.signInUserSession
              .getIdToken()
              .getJwtToken(),
          },
        });

        // Inicia la sesión de liveness después del inicio de sesión automático
        this.get_liveness_session();
      } else {
        console.error(
          "La sesión del usuario no contiene un token de identificación válido"
        );
      }
    })
    .catch((error) => {
      console.error("Error durante el inicio de sesión automático", error);
    });
  }

  public handleErrors(err: any) {
    console.log("err", err);
    //mostrar componente de error con un boton que diga atras y ejecute en el ngOnInit
    this.liveness_session_complete = true;
    this.start_liveness_session = false;
    this.face_live_message = "Por favor siga las instrucciones.";
    this.is_live = false;

    // Force remove the ReactDOM no ejecuta on init
    this.faceliveness.ngOnDestroy();

    this.ocurrioError = true;
  }

  public handleLivenessAnalysisResults(data: any) {
    console.log(data);
    if (data["Confidence"] > 80) {
      this.is_live = true;
      this.face_live_message = `Liveness check passed, Confidence ${Math.round(
        Number(data["Confidence"])
      )}`;
    } else {
      this.is_live = false;
      this.face_live_message = `Liveness check failed, Confidence ${Math.round(
        Number(data["Confidence"])
      )}`;
    }
    this.liveness_session_complete = true;
    this.start_liveness_session = false;
    this.ocurrioError = false;

    this.register();

    // Force remove the ReactDOM
    this.faceliveness.ngOnDestroy();
  }

  register() {
    const userData = sessionStorage.getItem("user");
    const user = JSON.parse(userData);

    console.log("user a registrar", user);

    // Muestra el spinner mientras se procesa la solicitud
    this.spinner.show();

    // Realiza el registro de usuario
    this.authService
    .register(user)
    .subscribe({
      next: (response) => {
        this.completoRegistro = true;
      },
      error: (error) => {
        console.error("Registro error:", error);
        this.snackBar.open(error.message, "Cerrar", {
          duration: 5000, // Duración del mensaje en milisegundos
          horizontalPosition: "center",
          verticalPosition: "bottom",
          panelClass: ["error-snackbar"], // Clase para estilos personalizados
        });
      },
    })
    .add(() => {
      this.spinner.hide();
    });
  }

  initate_liveness_session(data: {}) {
    this.is_live = false;
    this.session_id = data["SessionId"];
    this.confidence = 0;
    this.liveness_session_complete = false;
    this.completoRegistro = false;
    setTimeout(() => {
      this.spinner.hide();
      this.start_liveness_session = true;
    }, 3);
  }

  public navigateBack() {
    this.ocurrioError = false;
    this.get_liveness_session();
  }

  //id aleatorio:
  generateClientRequestToken(): string {
    // Genera un valor único, por ejemplo, usando un hash SHA-256 de un valor aleatorio y la fecha actual
    const randomValue = CryptoJS.lib.WordArray.random(16);
    const timestamp = new Date().toISOString();
    const uniqueValue = randomValue.toString(CryptoJS.enc.Hex) + timestamp;

    // Calcula el hash SHA-256
    const clientRequestToken = CryptoJS.SHA256(uniqueValue).toString(
      CryptoJS.enc.Hex
    );

    return clientRequestToken;
  }

  get_liveness_session() {
    this.start_liveness_session = false;
    const params = {
      ClientRequestToken: this.generateClientRequestToken(),
      KmsKeyId: "80b385a7-8549-4421-b6df-7e4a484e76b9",
      Settings: {
        AuditImagesLimit: 1,
        OutputConfig: {
          S3Bucket: "det-img-liveness-bm-beta",
          S3KeyPrefix: "", // Opcional: si quieres agregar un prefijo al nombre de la imagen
        },
      },
    };
    this.faceLivenessService.get_face_liveness_session(params);
  }

  navigateToLogin() {
    this.router.navigate(["/login"]);
  }
}
