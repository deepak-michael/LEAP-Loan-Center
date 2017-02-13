// Imports
import angular from 'angular';
import routes from './content.routes';

// CSS styles for 'content' page
import './content.scss';


/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
    .module('app.modules.content', [])
    .run(routes)
    .name;
