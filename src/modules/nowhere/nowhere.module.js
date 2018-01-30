// Imports
import angular from 'angular';
import routes from './nowhere.routes';

// CSS styles for 'about' page
import './nowhere.scss';

/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
    .module('app.modules.nowhere', [])
    .run(routes)
    .name;