// Imports
import ContentController from './content.controller';
import UserRoles from './../../core/auth/constants/userRoles';
import { profileData } from './../../core/auth/profile/profile.resolve';

/**
 * @ngInject
 * @param RouterHelper
 */
export default function routing(RouterHelper) {
    const states = [{
        state: 'modules.content',
        config: {
            url: '/loans',
            title: 'Content',
            data: {
                access: UserRoles.ROLE_LOGGED,
            },
            views: {
                'content@': {
                    template: require('./content.html'),
                    controller: ContentController,
                    controllerAs: 'vm',
                    resolve: {
                      _profileData: profileData,
                    }
                },
            },
        },
    }];

    RouterHelper.configureStates(states);
}
