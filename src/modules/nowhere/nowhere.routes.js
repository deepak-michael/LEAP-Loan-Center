// Imports
import NowhereController from './nowhere.controller';
import UserRoles from './../../core/auth/constants/userRoles';

/**
 * @ngInject
 * @param RouterHelper
 */
export default function routing(RouterHelper) {
    const states = [{
        state: 'modules.nowhere',
        config: {
            url: '/nowhere',
            title: 'No subscription',
            data: {
                access: UserRoles.ROLE_ANON,
            },
            views: {
                'content@': {
                    template: require('./nosubscription.html'),
                    controller: NowhereController,
                    controllerAs: 'vm',
                },
            },
        },
    }];

    RouterHelper.configureStates(states);
}
