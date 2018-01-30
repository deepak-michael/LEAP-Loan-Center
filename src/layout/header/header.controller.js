/**
 * @ngInject
 */
export default class HeaderController {
  /**
   * Constructor of the class
   *
   * @param {ui.router.state.$state}  $state
   * @param {AuthService}             AuthService
   */
  constructor($state, AuthService, UserService, MenuItemService, $scope, $window) {
    this.$state = $state;
    this.$window = $window;
    this.authService = AuthService;
    this.username = UserService.getUserName();
    this.menuItemService = MenuItemService;
    this.profile = UserService.getProfile().context ?  UserService.getProfile().context.user : {};

    $scope.$watch(() => $scope.user, (newValue) => {
      this.username = UserService.getUserName();
    });

    // For now we need a watcher for actual menu items - note that is $rootScope variable
    $scope.$watch('isAuthenticated', () => {
      this.items = this.menuItemService.getItems();
      this.tenant = UserService.getTenant();
    });

    $scope.opened = false;

    $scope.open = function(){
      $scope.opened = true;
    };

    $scope.close = function(){
      $scope.opened = false;
    };

    $scope.toggle = function(){

      if ($scope.opened){
        $scope.close();
      }
      else {
        $scope.open();
      }
    };

    $scope.getUserInitials = function(){
      var first = String(UserService.getProfile().context.user.firstName).toUpperCase().charAt(0);
      var last = String(UserService.getProfile().context.user.lastName).toUpperCase().charAt(0);

      return (first+last);
    };
  }

  /**
   * Method to logout current user.
   */
  logout() {
    var me = this;
    this.authService.logout().then(function(logoutInfo) {
        me.$window.location.href = logoutInfo.authServerLogoutURL;
    });
    this.username = "";
  }

}
