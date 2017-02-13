// Get configuration values
const config = require('./../config/config.json');

/**
 * Add all 3rd party library config stuff to this file.
 *
 * @ngInject
 *
 * @param {$httpProvider}       $httpProvider
 * @param {$mdThemingProvider}  $mdThemingProvider
 * @param {jwtOptions}          jwtOptionsProvider
 */
export default ($httpProvider, $mdThemingProvider) => {

  // Configure angular-material theme
  $mdThemingProvider
    .theme('default')
    .primaryPalette('blue')
    /*.accentPalette('blue')*/
  ;

};
