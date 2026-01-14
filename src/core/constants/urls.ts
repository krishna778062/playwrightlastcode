export const BACKEND_URLS = {
  // .simpplr.xyz domains (non-production environments)
  'test.simpplr.xyz': 'https://api-be.test.simpplr.xyz',
  'uat.simpplr.xyz': 'https://api-be.uat.simpplr.xyz',
  'uat-eu.simpplr.xyz': 'https://api-be.uat-eu.simpplr.xyz',
  'dev.simpplr.xyz': 'https://api-be.dev.simpplr.xyz',
  'app.simpplr.xyz': 'https://api-be.app.simpplr.xyz',
  'qa.simpplr.xyz': 'https://api-be.qa.simpplr.xyz',
  'perf.simpplr.xyz': 'https://api-be.perf.simpplr.xyz',
  // UAT .simpplr.com domains - backend is on .xyz (SSL cert is only for *.simpplr.xyz)
  'uat-eu.simpplr.com': 'https://api-be.uat-eu.simpplr.xyz',
  'uat.simpplr.com': 'https://api-be.uat.simpplr.xyz',
  // Production .simpplr.com domains - has proper SSL certs
  'app.simpplr.com': 'https://api-be.app.simpplr.com',
} as const;
