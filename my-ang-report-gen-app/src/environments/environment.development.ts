export const environment = {
  production: false,

  apiUrl: 'http://localhost:3017/api',

  msal: {
    clientId: 'YOUR_SPA_CLIENT_ID',
    tenantId: 'YOUR_TENANT_ID',
    redirectUri: 'http://localhost:4200',
    apiScope: 'api://YOUR_API_CLIENT_ID/access_as_user'
  }
};
