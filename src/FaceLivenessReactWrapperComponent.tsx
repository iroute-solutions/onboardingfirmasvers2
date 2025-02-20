import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";

import * as AWS from "aws-sdk";
import awsmobile from "./aws-exports";

const containerElementName = "faceLivenessReactContainer";
const dictionary = {
  en: null,
  es: {
    photosensitivyWarningHeadingText: "Advertencia de fotosensibilidad",
    photosensitivyWarningBodyText:
      "Esta verificación muestra luces de colores. Tenga cuidado si es fotosensible.",
    goodFitCaptionText: "Buen ajuste",
    tooFarCaptionText: "Demasiado lejos",
    hintCenterFaceText: "Centra tu cara",
    startScreenBeginCheckText: "Comenzar a verificar",
    hintTooFarText: "Acercarse a la cámara",
    instructionsBeginCheckText: "Empezar",
    hintConnectingText: "Conectando...",
    hintTooCloseText: "Retroceder",
    hintCanNotIdentifyText: "Mover la cara frente a la cámara",
    hintMoveFaceFrontOfCameraText: "Mover la cara frente a la cámara",
    hintVerifyingText: "Verificando...",
    hintHoldFacePositionCountdownText:
      "Mantenga la posición de la cara durante la cuenta regresiva",
    hintHoldFaceForFreshnessText: "No te muevas",
    instructionsHeaderHeadingText: "",
    instructionsHeaderBodyText: "",
    instructionListHeadingText:
      "Siga las instrucciones que se mostrarán para completar la verificación",
    photosensitivyWarningInfoText:
      "Un pequeño porcentaje de personas puede experimentar ataques epilépticos cuando se exponen a luces de colores. Tenga cuidado si usted o alguien de su familia padece una enfermedad epiléptica.",
  },
};

@Component({
    selector: "app-faceliveness-react-wrapper",
    template: `<span #${containerElementName}></span>`,
    // styleUrls: [''],
    encapsulation: ViewEncapsulation.None
})
export class FaceLivenessReactWrapperComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  @ViewChild(containerElementName, { static: true }) containerRef!: ElementRef;

  @Input() public counter = 10;
  @Input() public sessionId = null;
  @Output() public livenessResults = new EventEmitter<any>();
  @Output() public livenessErrors = new EventEmitter<any>();
  region = awsmobile["aws_project_region"];

  constructor() {}

  ngOnInit(): void {
    console.log("Component Loaded" + this.sessionId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
  }

  handleAnalysisComplete = async () => {
    var rekognition = new AWS.Rekognition();
    var params = {
      SessionId: this.sessionId,
    };
    rekognition
      .getFaceLivenessSessionResults(params)
      .promise()
      .then((data) => {
        this.livenessResults.emit(data);
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleError = async (err: any) => {
    this.livenessErrors.emit(err);
  };

  private render() {
    const { counter } = this;
    ReactDOM.render(
      <React.StrictMode>
        <div>
          <FaceLivenessDetector
            sessionId={this.sessionId}
            region={this.region}
            onAnalysisComplete={this.handleAnalysisComplete}
            onError={this.handleError}
            displayText={dictionary.es}
          />
        </div>
      </React.StrictMode>,
      this.containerRef.nativeElement
    );
  }
}
