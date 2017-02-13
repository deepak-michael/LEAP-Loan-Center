/**
 * @ngInject
 */
export default class AuthService {
  /**
   * Constructor of the AuthService.
   *
   * @param {$http}                   $http
   * @param {ui.router.state.$state}  $state
   * @param {$localStorage}           $localStorage
   * @param {authManager}             authManager
   * @param {UserService}             UserService
   * @param {LoggerService}           LoggerService
   * @param {UserRoles}               UserRoles
   * @param {config}                  config
   */
  constructor(
    $http, $state, $localStorage, $cookies,
    authManager,
    UserService, LoggerService,
    UserRoles, config
  ) {
    this.$http = $http;
    this.$state = $state;
    this.$localStorage = $localStorage;
    this.$cookies = $cookies;
    this.authManager = authManager;
    this.userService = UserService;
    this.logger = LoggerService;
    this.roles = UserRoles;
    this.config = config;
  }

  /**
   * Method to check if current user has specified role or not.
   *
   * @param {string} role
   * @returns {boolean}
   */
  authorize(role: string) {
    // Anon routes are available for everyone
    if (role === this.roles.ROLE_ANON) {
      return true;
    } else if (this.userService.getProfile()) { // Otherwise if user is authenticated check if he/she has that role
      return this.userService.getRoles().indexOf(role) !== -1;
    }

    // And otherwise always return false - fail safe
    return false;
  }

  /**
   * Method to check if current user is authenticated or not.
   *
   * @param {boolean} [suppress]
   */
  isAuthenticated(suppress: boolean = true) {
    if (!this.userService.getProfile() && !suppress) {
      this.logger.error('Auth error!');
    }

    return !!this.userService.getProfile();
  }

  /**
   * Method to logout current user.
   *
   * @param {boolean} [suppress]
   * @returns {*|Promise.<TResult>}
   */
  logout(suppress: boolean = false) {
    if (!suppress) {
      this.logger.success('Logged out successfully.');
    }

    // Reset local storage + un-authenticate current user
    this.$localStorage.$reset();
    this.$cookies.remove("AccessToken");
    this.authManager.unauthenticate();

    // And redirect user back to login page


    return this.$http
        .get(`/auth/logout`)
        .then(
            (response) => {
                if (!suppress) {
                    this.logger.success('Logged out successfully.');
                    return response.data;
                }
            }
        )
        ;
  }
}
