import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app/app.routes';

import {
  MSAL_INSTANCE
} from '@azure/msal-angular';

import {
  IPublicClientApplication
} from '@azure/msal-browser';


import {
  appConfig
} from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(async (appRef) => {
    const msalInstance =
      appRef.injector.get<IPublicClientApplication>(
        MSAL_INSTANCE
      );

    await msalInstance.initialize();
    await msalInstance.handleRedirectPromise();

    const accounts =
      msalInstance.getAllAccounts();

    if (
      !msalInstance.getActiveAccount() &&
      accounts.length > 0
    ) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  })
  .catch((error) => {
    console.error(
      'Application startup failed:',
      error
    );
  });
//
// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(appRoutes),
//     provideHttpClient()
//   ]
// }).catch(err => console.error(err));
//

// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter } from '@angular/router';
// import { AppComponent } from './app/app.component';
// import { routes } from './app/app.routes';
// import { provideHttpClient } from '@angular/common/http';
// import { provideAnimations } from '@angular/platform-browser/animations';
//
// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient(),
//     provideAnimations()
//   ]
// }).catch(err => console.error(err));
