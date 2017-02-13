// Imports
import angular from 'angular';
import routes from './import.routes';

// CSS styles for 'import' page
import './import.css';


/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
    .module('app.modules.contentImport', [])
    .run(routes)
    .name;
