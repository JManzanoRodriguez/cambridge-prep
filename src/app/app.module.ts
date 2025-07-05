import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module/shared.module';

// Importar el módulo Core
import { CoreModule } from './core/core.module';

/**
 * Módulo principal de la aplicación
 * 
 * Importa y configura todos los módulos necesarios para la aplicación,
 * incluyendo el módulo Core que contiene servicios e interceptores.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    HttpClientModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    SharedModule,
    CoreModule // Importar el módulo Core
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
