/**
 * @ngInject
 */
export default class JwtHeaderInterceptor {
    /**
     * Constructor of the class.
     *
     * @param {}
     * @param {$injector} $injector
     */
    constructor($injector, $localStorage, $rootScope) {
        this.$injector = $injector;
        this.$localStorage = $localStorage;
        this.$rootScope = $rootScope;
    }

    request = (config) => {
        if(config.url == "/auth/getToken" && config.method == "POST") {
          return config;
        }
      //Checking if already present to prevent overriding of what was explicitly set in request
        if (this.$rootScope.isAuthenticated) {
            if (!config.headers.Authorization) {
                config.headers.authorization = 'Bearer ' + this.$localStorage.token;
            }
        } else {
            this.$injector
                .get('LoggerService')
                .error('User not logged in', config, 'JwtHeaderInterceptor');
        }
        return config;
    }
}
