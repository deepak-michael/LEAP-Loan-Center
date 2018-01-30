// Imports
import ContentViewController from './contentView.controller';
import UserRoles from './../../core/auth/constants/userRoles';

/**
 * @ngInject
 * @param RouterHelper
 */
export default function routing(RouterHelper) {
    const states = [{
        state: 'modules.contentView',
        config: {
            url: '/contentview',
            title: 'ContentView',
            data: {
                access: UserRoles.ROLE_LOGGED,
            },
            params: {
                contentId: 0
            },
            views: {
                'content@': {
                    template: require('./contentView.html'),
                    controller: ContentViewController,
                    controllerAs: 'vm',
                },
            },
            onEnter: [
                "$mdDialog",
                function($mdDialog) {
                    $mdDialog.show({
                        controller: ContentViewController,
                        controllerAs: 'vm',
                        template: require('./contentView.html'),
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