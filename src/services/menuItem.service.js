// Imports
import MenuItem from './../entities/menuItem';

/**
 * @desc  MenuItemService class.
 * @ngInject
 */
export default class MenuItemService {
  /**
   * Constructor of the class.
   *
   * @param {ui.router.state.$state}  $state
   * @param {$mdSidenav}              $mdSidenav
   * @param {AuthService}             AuthService
   * @param {UserService}             UserService
   * @param {UserRoles}               UserRoles
   */
  constructor(
    $state, $mdSidenav,
    AuthService, UserService, UserRoles
  ) {
    this.$state = $state;
    this.$mdSidenav = $mdSidenav;
    this.authService = AuthService;
    this.userService = UserService;

    // Actual menu items
    this.items = [
            {
                title: 'Profile',
                /*state: 'auth.profile',*/
                state: 'modules.profile',
                access: UserRoles.ROLE_LOGGED,
            },
            {
                title: 'Loans',
                state: 'modules.content',
                access: UserRoles.ROLE_ANON,
            },
            {
                title: 'About',
                state: 'modules.about',
                access: UserRoles.ROLE_ANON,
            }
    ].map(item => new MenuItem(item));
  }

  /**
   * Getter method for all menu items.
   *
   * @returns {MenuItem[]}
   */
  getItems() {
    const iterator = (item: MenuItem) => {
      if (item.items.length) {
        item.items.filter(iterator);

        if (item.items.length === 0) {
          return false;
        }
      }

      let hasAccess = this.authService.authorize(item.access);

      if (hasAccess && item.hideLogged) {
        hasAccess = !this.userService.getProfile();
      }

      return hasAccess;
    };

    return this.items.filter(iterator);
  }

  /**
   * Method to change application state to another one.
   *
   * @param {MenuItem}  item
   * @param {Object}    [params]
   * @returns {promise}
   */
  goToPage(item: MenuItem, params: Object = {}) {
    const parameters = (Object.is({}, params) && !Object.is({}, item.params)) ? item.params : params;

    this.$mdSidenav('left').close();

    return (this.$state.current.name === item.state) ? this.$state.reload() : this.$state.go(item.state, parameters);
  }
}
