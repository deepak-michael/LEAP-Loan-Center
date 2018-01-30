/**
 * @ngInject
 */
export default class LoginController {
  /**
   * Constructor of the class.
   *
   * @param {ui.router.state.$state}  $state
   * @param {AuthService}             AuthService
   */
  constructor($state, AuthService, config) {
    this.$state = $state;
    this.authService = AuthService;
    this.loading = false;
    this.subscriptionName = config.SUBSCRIPTION_NAME;

    if (AuthService.isAuthenticated()) {
      this.$state.go('modules.profile');
    }

    this.reset();
  }

  // Method to make login request to specified backend.
  login() {
    this.loading = true;

    this.authService
      .authenticate(this.credentials)
      .then(() => {
        this.$state.go('modules.profile');
      })
      .catch(() => {
        this.reset();
      })
      .finally(() => {
        this.loading = false;
      })
    ;
  }

  // Method to "reset" used credentials object.
  reset() {
    this.credentials = {
      username: '',
      password: '',
    };
  }
}
