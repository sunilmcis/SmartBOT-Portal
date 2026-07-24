//import { environment } from '../environments/environment';
import {
  ApplicationConfig,
  provideZoneChangeDetection
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication
} from '@azure/msal-browser';

import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalService
} from '@azure/msal-angular';

// import { routes } from './app.routes';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

export function msalInstanceFactory():
  IPublicClientApplication {

  return new PublicClientApplication({
    auth: {
      clientId: environment.msal.clientId,

      authority:
        `https://login.microsoftonline.com/` +
        `${environment.msal.tenantId}`,

      redirectUri: environment.msal.redirectUri,

      postLogoutRedirectUri:
        environment.msal.redirectUri
    },

    cache: {
      cacheLocation: BrowserCacheLocation.SessionStorage
    }
  });
}

export function msalGuardConfigFactory():
  MsalGuardConfiguration {

  return {
    interactionType: InteractionType.Redirect,

    authRequest: {
      scopes: [
        'openid',
        'profile',
        'email',
        environment.msal.apiScope
      ]
    }
  };
}

export function msalInterceptorConfigFactory():
  MsalInterceptorConfiguration {

  const protectedResourceMap =
    new Map<string, string[]>();

  protectedResourceMap.set(
    `${environment.apiUrl}/`,
    [environment.msal.apiScope]
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(appRoutes),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    {
      provide: MSAL_INSTANCE,
      useFactory: msalInstanceFactory
    },

    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: msalGuardConfigFactory
    },

    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: msalInterceptorConfigFactory
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};
