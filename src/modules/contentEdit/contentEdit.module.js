/**
 * Created by michad on 10/13/16.
 */

// Imports
import angular from 'angular';
import routes from './contentEdit.routes';

// CSS styles for 'content' page
import './contentEdit.css';

/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
    .module('app.modules.contentEdit', [])
    .run(routes)
    .name;
