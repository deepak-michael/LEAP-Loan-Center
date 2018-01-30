/**
 * @desc  This file contains core route + state change event handling.
 * @ngInject
 *
 * @param {*}                       $rootScope
 * @param {ui.router.state.$state}  $state
 * @param {$localStorage}           $localStorage
 * @param {jwtHelper}               jwtHelper
 * @param {RouterHelper}            RouterHelper
 * @param {AuthService}             AuthService
 * @param {UserService}             UserService
 * @param {LoggerService}           LoggerService
 */
export default (
  $rootScope, $state, $localStorage, $location,
  jwtHelper,
  RouterHelper, AuthService, UserService, LoggerService, config
) => {
  const states = [{
    state: '404',
    config: {
      url: '/404',
      title: '404',
      parent: 'layout',
      views: {
        'content@': {
          template: require('./404.html'),
        },
      },
    },
  }];

  // Configure default routes + otherwise route
  RouterHelper.configureStates(states);

  let bypass;

  var subscriptionParam = $location.search()['subscription-name'];
  var originalLocationSearch = $location.search();

  // Check user role for requested state + fetch new JWT if current one is expired
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState) => {
    if (bypass) {
      bypass = false;

      return;
    }

    event.preventDefault();

    const token = $localStorage.token;
    const refreshToken = $localStorage.refreshToken;

    if(fromState.abstract && fromState.name == "") {
        $rootScope.subscriptionName = subscriptionParam;
        config.SUBSCRIPTION_NAME = subscriptionParam;
    }

    const checkState = () => {
      bypass = true;
      if(!subscriptionParam || subscriptionParam == 'undefined') {
          return $state.go('modules.nowhere');
      }


      // User don't have access to this state,
      if ({}.hasOwnProperty.call(toState.data || {}, 'access')
          && !AuthService.authorize(toState.data.access)
      ) {
        //LoggerService.error(`You don't have access to '${toState.title}' page.`);
        return fromState.abstract ? $state.go('auth.login') : $state.reload();
      }

      return $state.go(toState, toParams);
    };

    if (token) {
      if (token === 'fake-jwt-token' || !jwtHelper.isTokenExpired(token)) {
        checkState();
      } else {
          if (refreshToken) {
              AuthService
                  .refreshToken(refreshToken)
                  .then(checkState)
                  .catch(() => {
                      bypass = true;

                      LoggerService.success('Please login.');

                      AuthService.logout(true);
                  })
              ;
          }
          else {
              bypass = true;

              LoggerService.success('Please login.');

              AuthService.logout(true);

          }
      }
    } else {
      checkState();
    }
  });

  // Add success handler for route change
  $rootScope.$on('$stateChangeSuccess', (event, toState) => {
      //restore all query string parameters back to $location.search
      $location.search(originalLocationSearch);

      $rootScope.containerClass = toState.containerClass;
  });

  // Watcher for user authentication status
  $rootScope.$watch('isAuthenticated', () => {
    var userProfile = UserService.getProfile();
    $rootScope.user = userProfile ? userProfile.context.user : {};
  });
};
