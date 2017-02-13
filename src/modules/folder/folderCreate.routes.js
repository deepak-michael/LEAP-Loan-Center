// Imports
import FolderController from './folder.controller';
import UserRoles from './../../core/auth/constants/userRoles';

/**
 * @ngInject
 * @param RouterHelper
 */
export default function routing(RouterHelper) {
    const states = [{
        state: 'modules.folderCreate',
        config: {
            url: '/',
            title: 'FolderCreate',
            data: {
                access: UserRoles.ROLE_LOGGED,
            },
            params: {
                contentId: 0
            },
            views: {
                'content@': {
                    template: require('./folderCreate.html'),
                    controller: FolderController,
                    controllerAs: 'vm',
                },
            },
            onEnter: [
                "$mdDialog",
                function($mdDialog) {
                    $mdDialog.show({
                        controller: FolderController,
                        controllerAs: 'vm',
                        //templateUrl: 'dialog1.tmpl.html',
                        template: require('./folderCreate.html'),
                        parent: angular.element(document.body),
                        clickOutsideToClose:true,
                        size: 'sm'
                    }).result.finally(function() {
                        $stateProvider.go('^');
                    });
                }
            ]
        },
    }];

    RouterHelper.configureStates(states);
}