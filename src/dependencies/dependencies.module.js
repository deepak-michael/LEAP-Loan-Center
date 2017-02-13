// Imports
import angular from 'angular';
import angularJWT from 'angular-jwt';
import angularLoadingBar from 'angular-loading-bar';
import angularMaterial from 'angular-material';
import ngstorage from 'ngstorage';
import uiRouter from 'angular-ui-router';
import ngResource from 'angular-resource';
import ngCookies from 'angular-cookies';

import mdDataTable from 'angular-material-data-table';
import 'angular-material-data-table/dist/md-data-table.css';

import ngMdIcons from 'angular-material-icons';

import config from './dependencies.config';

/**
 * @ngInject
 */
export default angular
  .module('app.dependencies', [
    angularJWT, angularLoadingBar, angularMaterial, ngMdIcons,
    ngstorage.name, // see https://github.com/gsklee/ngStorage/pull/159
    uiRouter,ngResource,
    mdDataTable, ngCookies
  ])
  .config(config)
  .run((authManager) => {
    authManager.checkAuthOnRefresh();
  })
  .name;
