import { enableProdMode, importProvidersFrom } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { environment } from "./environments/environment";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { AppRoutingModule } from "./app/app-routing.module";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatGridListModule } from "@angular/material/grid-list";
import { AmplifyAuthenticatorModule } from "@aws-amplify/ui-angular";
import { MatIconModule } from "@angular/material/icon";
import { NgxSpinnerModule } from "ngx-spinner";
import { WebcamModule } from "ngx-webcam";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "./app/angular-material.module";
import { AppComponent } from "./app/app.component";

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      MatGridListModule,
      AmplifyAuthenticatorModule,
      MatIconModule,
      NgxSpinnerModule,
      WebcamModule,
      FormsModule,
      ReactiveFormsModule,
      AngularMaterialModule
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
