/* global API_URL, VERSION */
export default (app) => {
  app.constant('config', {
    API_URL : "/",
    TENANT_NAME,
    SUBSCRIPTION_NAME,
    VERSION,
  });
};
