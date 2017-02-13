// Imports
import ImportController from './import.controller';
import UserRoles from './../../core/auth/constants/userRoles';

/**
 * @ngInject
 * @param RouterHelper
 */
export default function routing(RouterHelper) {
    const states = [{
        state: 'modules.import',
        config: {
            url: '/',
            title: 'Import',
            data: {
                access: UserRoles.ROLE_LOGGED,
            },
            views: {
                'content@': {
                    template: require('./import.html'),
                    controller: ImportController,
                    controllerAs: 'vm',
                },
            },
        },
    }];

    RouterHelper.configureStates(states);
}
