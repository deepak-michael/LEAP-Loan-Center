// Imports
import ContentEditController from './contentEdit.controller';
import UserRoles from './../../core/auth/constants/userRoles';
import { profileData } from './../../core/auth/profile/profile.resolve';

/**
 * @ngInject
 * @param RouterHelper
 */
export default function routing(RouterHelper) {
    const states = [{
        state: 'modules.contentEdit',
        config: {
            url: '/',
            title: 'ContentEdit',
            data: {
                access: UserRoles.ROLE_LOGGED,
            },
            params: {
                contentId: 0
            },
            views: {
                'content@': {
                    template: require('./contentEdit.html'),
                    controller: ContentEditController,
                    controllerAs: 'vm',
                    resolve: {
                      _profileData: profileData,
                    }
                },
            },
            onEnter: [
                "$mdDialog",
                function($mdDialog) {
                    $mdDialog.show({
                        controller: ContentEditController,
                        controllerAs: 'vm',
                        //templateUrl: 'dialog1.tmpl.html',
                        template: require('./contentEdit.html'),
                        parent: angular.element(document.body),
                        clickOutsideToClose:true,
                        size: 'sm',
                        resolve: {
                          _profileData: profileData,
                        }

                    }).result.finally(function() {
                        $stateProvider.go('^');
                    });
                }
            ]
        },
    }];

    RouterHelper.configureStates(states);
}
