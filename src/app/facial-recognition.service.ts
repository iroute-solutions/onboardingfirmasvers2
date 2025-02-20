import { Observable, BehaviorSubject, Observer } from "rxjs";
import { Inject, Injectable } from "@angular/core";

//new
import { Auth } from "aws-amplify";
import * as AWS from "aws-sdk";

@Injectable({
  providedIn: "root",
})
export class FacialRecognitionService {
  private readonly photoUpload: string = "ImageUpload";
  private readonly getToken: string = "Authentication";
  private readonly comparebyURls: string = "FaceCompareByUrls";

  private readonly ingresaBloqueo: string = "IngresaBloqueo";
  private readonly rafagaPhotos: string = "FacePerson";
  url!: string;

  //new
  public liveness_session: BehaviorSubject<[string, {}]> = new BehaviorSubject<
    [string, {}]
  >(["empty", {}]);
  private readonly dataAuthFaceliness: string = "DataFaceLiveness";
  private readonly photoUploadS3: string = "ImageUploadS3";
  private readonly comparebyURlsLiveness: string = "FaceCompareByUrlsLiveness";

  constructor() {}

  private get urlphotoUpload() {
    return this.url + this.photoUpload;
  }
  private get urlgetToken() {
    return this.url + this.getToken;
  }
  private get compareFace() {
    return this.url + this.comparebyURls;
  }
  private get ingresaBlock() {
    return this.url + this.ingresaBloqueo;
  }
  private get confirmIsPerson() {
    return this.url + this.rafagaPhotos;
  }

  //new
  private get urlphotoUploadS3() {
    return this.url + this.photoUploadS3;
  }
  private get authFacelivenessData() {
    return this.url + this.dataAuthFaceliness;
  }
  private get compareFaceLiveness() {
    return this.url + this.comparebyURlsLiveness;
  }

  async ingresaB(CedulaF: any) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      Cedula: CedulaF,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    const endpointUrl = `${this.ingresaBlock}`;

    return fetch(endpointUrl, requestOptions);
  }

  async uploadPhoto(token: any, blob: any, filename: any) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const file = new File([blob], `/${filename}.jpg`, { type: blob.type });

    const formdata1 = new FormData();
    formdata1.append("formFile", file);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata1,
      redirect: "follow",
    };
    const endpointUrl = `${this.urlphotoUpload}`;

    return fetch(endpointUrl, requestOptions);
  }

  comparePhotos(imagen1: string, imagen2: string, token: string) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const endpointUrl = `${this.compareFace}`;
    return fetch(
      ` ${endpointUrl}?imagen1=${imagen1}&imagen2=${imagen2}`,
      requestOptions
    );
  }

  isPerson(token: any, files: File[]) {
    const formdataManyPhotos = new FormData();
    files.forEach((element) => {
      formdataManyPhotos.append("", element);
    });

    const requestOptions: RequestInit = {
      method: "POST",
      body: formdataManyPhotos,
      redirect: "follow",
    };
    const endpointUrl = `${this.confirmIsPerson}?Autorizacion=${token}`;

    return fetch(endpointUrl, requestOptions);
  }

  //new
  async uploadPhotoS3(token: any, blob: any, filename: any) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const file = new File([blob], `/${filename}.jpg`, { type: blob.type });

    const formdata1 = new FormData();
    formdata1.append("formFile", file);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata1,
      redirect: "follow",
    };
    const endpointUrl = `${this.urlphotoUploadS3}`;

    return fetch(endpointUrl, requestOptions);
  }
  comparePhotosLiveness(imagen1: string, imagen2: string, token: string) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const endpointUrl = `${this.compareFaceLiveness}`;
    return fetch(
      ` ${endpointUrl}?imagen1=${imagen1}&imagen2=${imagen2}`,
      requestOptions
    );
  }

  async get_current_session() {
    return await Auth.currentSession();
  }

  // Modify to get face liveness session
  async get_face_liveness_session(params: any) {
    var rekognition = new AWS.Rekognition();
    rekognition.createFaceLivenessSession(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else {
        this.liveness_session.next(["success", data]);
      }
    });
  }
}
