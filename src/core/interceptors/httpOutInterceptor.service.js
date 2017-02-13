/**
 * Created by michad on 10/20/16.
 */

export default class HttpOutInterceptor {
  /**
   * Constructor of the class.
   *
   * @param {}
   * @param {$injector} $injector
   */
  constructor($injector) {
    this.$injector = $injector;
  }

  request = (config) => {
    if(config.url == "/auth/getToken" && config.method == "POST") {
      return config;
    }

    if(config.url.includes('.')) {
      return config;
    }

    this.$injector
      .get('LoggerService').log('Request Method: '+ config.method + ' URL: ' + config.url, JSON.stringify(config.data), 'Http request');
    //Checking if already present to prevent overriding of what was explicitly set in request

    return config;
  }
}
