import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';
import { enableDebugTools } from '@angular/platform-browser';
import { ApplicationRef } from '@angular/core';

platformBrowserDynamic().bootstrapModule(AppModule).then(moduleRef => {
  const applicationRef = moduleRef.injector.get(ApplicationRef);
  enableDebugTools(applicationRef.components[0]);
});

if (!environment.production) {
  console.warn('Development mode enabled - Detailed errors available');
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
