/**
 * Created by michad on 10/13/16.
 */

// Imports
import angular from 'angular';
import routes from './folderCreate.routes';


/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
    .module('app.modules.folderCreate', [])
    .run(routes)
    .name;
