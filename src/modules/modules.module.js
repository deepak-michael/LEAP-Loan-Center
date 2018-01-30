// Imports
import angular from 'angular';
import about from './about/about.module';
import nowhere from './nowhere/nowhere.module';
import contentEdit from './contentEdit/contentEdit.module';
import content from './content/content.module';
import importContent from './import/import.module';
import routes from './modules.routes';

/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
  .module('app.modules', [
    about, nowhere, contentEdit, content, importContent,
  ])
  .run(routes)
  .name;
