import {GraphQLNonNull} from 'graphql'
import {InputMember, UserProfile} from 'src/server/graphql/schemas'
import upsertMember from 'src/server/actions/upsertMember'
import {LGNotAuthorizedError} from 'src/server/util/error'
import {userCan} from 'src/common/util'

export default {
  type: UserProfile,
  args: {
    values: {type: new GraphQLNonNull(InputMember)}
  },
  async resolve(source, {values}, {rootValue: {currentUser}}) {
    if (!userCan(currentUser, 'createMember')) {
      throw new LGNotAuthorizedError('You are not authorized to create members.')
    }

    return upsertMember(values)
  }
}
