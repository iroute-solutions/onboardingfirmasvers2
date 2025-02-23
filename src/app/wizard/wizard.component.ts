import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "src/environments/environment";
import { ReactiveFormsModule } from "@angular/forms";
import { MatStepperModule } from "@angular/material/stepper";
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressBarModule } from "@angular/material/progress-bar";

@Component({
  selector: "app-wizard",
  templateUrl: "./wizard.component.html",
  styleUrls: ["./wizard.component.scss"],
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
})
export class WizardComponent implements AfterViewInit {
  formGroup: FormGroup;
  fileName = "";
  contractUrl: string | null = null;
  termsText = "";
  rutaPDF: any;
  filePreview: any;
  private baseUrl: string = environment.baseUrl;
  contrato_id: string;
  empresaID: string;
  fotoTomada: string;
  isFaceVerificationStep: boolean = false;
  showPhoto: boolean = false; // Para mostrar la foto tomada
  showRetakeButton: boolean = false; // Para mostrar el botón de volver a tomar la foto
  video: any;
  validando: boolean = false;
  identidadValidada: boolean = false;
  mostrarErrorVerificacion: boolean = false;
  correoEmpresa: string = "";
  @ViewChild("video") videoElement: ElementRef;
  private videoStream: MediaStream;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.formGroup = this.formBuilder.group({
      termsAccepted: [false, Validators.requiredTrue],
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      file: [null, Validators.required],
      telefono: ["", Validators.required],
      identificacion: ["", Validators.pattern("^[0-9]*$")],
    });
  }

  ngOnInit(): void {
    // Obtener el valor de 'contract-id' de la URL
    this.route.queryParamMap.subscribe((params) => {
      this.contractUrl = params.get("url");
      this.correoEmpresa = params.get("correoEmpresa");
    });

    if (!this.contractUrl) {
      alert("No se ha proporcionado un contrato");
      return;
    }

    if (!this.correoEmpresa) {
      alert(
        "No se ha proporcionado un correo de la empresa, solo enviará el contrato firmado al firmante"
      );
    }

    this.contrato_id = this.contractUrl.split("/")[3];
    this.empresaID = this.contractUrl.split("/")[1];

    this.termsText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam commodo, ...`;

    this.rutaPDF = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.baseUrl}/integracion_verDoc?url=${this.contractUrl}`
    );
  }

  ngAfterViewInit() {
    // Esto asegura que la cámara solo se active cuando estemos en la verificación facial
    if (this.isFaceVerificationStep && !this.fotoTomada) {
      this.startVideo();
    }
  }

  ngOnDestroy() {
    // Detenemos la cámara al destruir el componente
    if (this.videoStream) {
      const tracks = this.videoStream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  }

  // Inicia el video solo si estamos en el paso de verificación facial
  startVideo() {
    if (this.isFaceVerificationStep) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoStream = stream; // Guardamos la referencia al flujo para detenerlo más tarde
        })
        .catch((err) => {
          console.error("Error al acceder a la cámara", err);
        });
    }
  }

  // Cambia el estado de la verificación facial para activar o desactivar la cámara
  activarVerificacionFacial() {
    this.isFaceVerificationStep = true;
    if (!this.fotoTomada) {
      this.startVideo();
    }
  }

  // Detenemos la cámara cuando se salga del paso de verificación facial
  desactivarVerificacionFacial() {
    this.isFaceVerificationStep = false;
    this.stopVideo();
  }

  tomarFoto() {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Establece el tamaño del canvas según el tamaño del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibuja la imagen del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convierte el canvas a una imagen en base64
    this.fotoTomada = canvas.toDataURL("image/png");
    console.log("Foto tomada:", this.fotoTomada);

    // Detenemos el video después de tomar la foto
    this.stopVideo();

    // Mostrar la foto y el botón para volver a tomar la foto
    this.showPhoto = true;
    this.showRetakeButton = true;
  }

  stopVideo() {
    if (this.videoStream) {
      const tracks = this.videoStream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  }

  retakePhoto() {
    // Vuelve a mostrar el video y reinicia el estado para tomar una nueva foto
    this.showPhoto = false;
    this.showRetakeButton = false;
    this.startVideo();
  }

  onStepChange(event: any) {
    const currentStep = event.selectedIndex;
    if (currentStep === 3) {
      this.activarVerificacionFacial();
    } else {
      this.desactivarVerificacionFacial();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (allowedTypes.includes(file.type)) {
        this.formGroup.patchValue({
          file: file,
        });
        this.fileName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
          this.filePreview = reader.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.fileName = "";
        event.target.value = null;
      }
    }
  }

  validarVerificacionFacial(stepper: any) {
    this.validando = true;
    this.mostrarErrorVerificacion = false;
    new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.3; // Simula éxito en un 70% de los casos
        resolve(success);
      }, 4000);
    }).then((result) => {
      this.validando = false;
      if (result) {
        this.identidadValidada = true;
        stepper.next();
      } else {
        this.mostrarErrorVerificacion = true;
        this.identidadValidada = false;
      }
    });
  }

  enviarFormulario() {
    if (this.formGroup.valid && this.identidadValidada) {
      const body = {
        firmanteID: this.formGroup.value.identificacion,
        nombre: this.formGroup.value.firstName,
        apellidos: this.formGroup.value.lastName,
        correo: this.formGroup.value.email,
        telefono: this.formGroup.value.telefono,
        contrato_id: this.contrato_id,
        empresaID: this.empresaID,
        correoEmpresa: this.correoEmpresa || "",
      };
      console.log("Body:", body);
    }
  }
}
