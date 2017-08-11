import {GraphQLNonNull, GraphQLID, GraphQLString} from 'graphql'
import {GraphQLInputObjectType} from 'graphql/type'

export default new GraphQLInputObjectType({
  name: 'InputMember',
  description: 'A member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The user ID'},
    inviteCode: {type: new GraphQLNonNull(GraphQLString), description: 'Invite code used to sign up.'},
  })
})
