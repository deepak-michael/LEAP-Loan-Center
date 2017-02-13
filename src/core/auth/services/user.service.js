/**
 * @ngInject
 */
export default class UserService {
  /**
   * Constructor of the class.
   *
   * @param {$rootScope}    $rootScope
   * @param {$http}         $http
   * @param {$localStorage} $localStorage
   * @param {jwtHelper}     jwtHelper
   * @param {config}        config
   */
  constructor(
    $rootScope, $http, $localStorage, $cookies,
    authManager,
    jwtHelper,
    config,
    $q,
    UserRoles,
    $state
  ) {
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$localStorage = $localStorage;
    this.$cookies = $cookies;
    this.authManager = authManager;
    this.jwtHelper = jwtHelper;
    this.$q = $q;
    this.$state = $state;
    this.config = config;
    this.userRoles = UserRoles;
  }

  /**
   * Method returns user profile data from Json Web Token or boolean false, if user isn't authenticated at all.
   *
   * @returns {boolean|object}
   */
  getProfile() {
    var tokenName = 'AccessToken';
    if(this.$cookies.get(tokenName)) {
        this.$localStorage.token = this.$cookies.get(tokenName);
        this.$rootScope.isAuthenticated = true;
    }
    else {
        this.$localStorage.token = this.$cookies.get(tokenName);
        this.$rootScope.isAuthenticated = false;
    }
    return this.$rootScope.isAuthenticated ? this.jwtHelper.decodeToken(this.$localStorage.token) : false;
  }

  /**
   * Getter method for current user roles. If user isn't authenticated method returns empty array.
   *
   * @returns {string[]}
   */
  getRoles(addLoggedIn: boolean = true) {
    var profile = this.getProfile();
    if(profile && profile.context && Array.isArray(profile.context.subscriptions)) {
      var userSubscription = profile.context.subscriptions.find((subscription) => {
        return subscription.tenant.name == this.config.TENANT_NAME;
      });
      if(userSubscription) {
        //user is logged in
        var roles = userSubscription.roles;
        if (addLoggedIn) {
          roles.push(this.userRoles.ROLE_LOGGED);
        }
        return roles;
      }
    }
    return [];
  }

  /**
   * Method to fetch user profile data from backend server.
   *
   * @returns {HttpPromise}
   */
  fetchProfile() {
    var profile = null;//this.getProfile();
    if(profile && profile.context) {
      return this.$q.resolve({
          data : profile.context.user
      });
    }
    return this.$http.get(`${this.config.API_URL}auth/profile`).then( response=> {
      var user;
      if(!response.data.context) {
        // Reset local storage + un-authenticate current user
        this.$localStorage.$reset();
        this.$cookies.remove("AccessToken");
        this.authManager.unauthenticate();

        this.$state.go('auth.login');
      }
      else {
        user = response.data.context.user;
      }
      return {
        data : user
      }
    });
  }

  getUserName() {
    var profile = this.getProfile();
    return profile ? profile.context.user.firstName : "";
  }
}
