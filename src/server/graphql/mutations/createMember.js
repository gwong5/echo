import {GraphQLNonNull} from 'graphql'
import {InputMember, UserProfile} from 'src/server/graphql/schemas'
import upsertMember from 'src/server/actions/upsertMember'

export default {
  type: UserProfile,
  args: {
    values: {type: new GraphQLNonNull(InputMember)}
  },
  async resolve(source, {values}, {rootValue: {currentUser}}) {
    console.log('Current Users : ', currentUser)
    // userCan(currentUser, 'createMember')

    return upsertMember(values)
  }
}
