import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { AngularFireModule } from "@angular/fire";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { NgxElectronModule } from 'ngx-electron';

const firebaseConfig = {
  apiKey: "AIzaSyDI-N2D6iWnEFmtnlJLHWmWZQt34_lGzvQ",
  authDomain: "attendance-accd4.firebaseapp.com",
  projectId: "attendance-accd4",
  storageBucket: "attendance-accd4.appspot.com",
  messagingSenderId: "655660195738",
  appId: "1:655660195738:web:6af3de32f81f216fb5a423",
  measurementId: "G-2ZM04JX1TQ"
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    ConfirmationModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    NgxElectronModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
