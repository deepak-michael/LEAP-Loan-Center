// Imports
import angular from 'angular';
import ErrorInterceptor from './errorInterceptor.service';
import HttpOutInterceptor from './httpOutInterceptor.service';

/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
  .module('app.core.interceptors', [])
  .service('ErrorInterceptor', ErrorInterceptor)
  .service('HttpOutInterceptor', HttpOutInterceptor)
  .name;
