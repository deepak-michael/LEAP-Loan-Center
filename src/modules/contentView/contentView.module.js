/**
 * Created by michad on 10/13/16.
 */

// Imports
import angular from 'angular';
import routes from './contentView.routes';

// CSS styles for 'content' page
import './contentView.css';

/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
    .module('app.modules.contentView', [])
    .run(routes)
    .name;
