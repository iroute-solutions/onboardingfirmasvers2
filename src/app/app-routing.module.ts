import { NgModule } from "@angular/core";

import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { FaceLivenessComponent } from "./face-liveness/face-liveness.component";

export const routes: Routes = [
  { path: "", redirectTo: "auth", pathMatch: "full" },
  { path: "auth", component: LoginComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: LoginComponent },
  { path: "face-liveness", component: FaceLivenessComponent },
  { path: "**", redirectTo: "", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
