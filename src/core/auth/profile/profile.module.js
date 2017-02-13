// Imports
import angular from 'angular';
import routes from './profile.routes';

/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
  /*.module('app.core.auth.profile', [])*/
  .module('modules.profile', [])
  .run(routes)
  .name;
