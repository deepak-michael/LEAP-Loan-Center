// Imports
import angular from 'angular';
import MenuItemService from './menuItem.service';
import FolderService from './folders.service';
import ObjectService from './object.service';
import ContentService from './content.service';

/**
 * @desc  Module initialize.
 *
 * @ngInject
 */
export default angular
  .module('app.services', [])
  .service('MenuItemService', MenuItemService)
  .service('FolderService', FolderService)
  .service('ObjectService', ObjectService)
  .service('ContentService', ContentService)
  .name;
