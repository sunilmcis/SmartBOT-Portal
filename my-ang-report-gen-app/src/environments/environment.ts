export const environment = {
  production: true,

  apiUrl: '/api',

  /* msal: {
    clientId: 'YOUR_SPA_CLIENT_ID',
    tenantId: 'YOUR_TENANT_ID',
    redirectUri: 'https://YOUR-SMARTBOT-DOMAIN',
    apiScope: 'api://YOUR_API_CLIENT_ID/access_as_user'
  } */

  export const msalConfig = {
    auth: {
      clientId: "YOUR_CLIENT_ID",
      authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
      redirectUri: "http://localhost:4200"
    }
  };
};
