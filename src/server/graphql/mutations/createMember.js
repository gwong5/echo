import {GraphQLNonNull, GraphQLString, GraphQLID} from 'graphql'
import {User} from 'src/server/graphql/schemas'
import upsertMember from 'src/server/actions/upsertMember'
import {LGNotAuthorizedError} from 'src/server/util/error'
import {userCan} from 'src/common/util'

export default {
  type: User,
  args: {
    id: {type: new GraphQLNonNull(GraphQLID)},
    inviteCode: {type: new GraphQLNonNull(GraphQLString)},
  },
  async resolve(source, {id, inviteCode}, {rootValue: {currentUser}}) {
    if (!userCan(currentUser, 'createMember')) {
      throw new LGNotAuthorizedError('You are not authorized to create members.')
    }
    return upsertMember({id, inviteCode})
  }
}
