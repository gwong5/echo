import {GraphQLNonNull, GraphQLID} from 'graphql'
import {GraphQLObjectType} from 'graphql/type'
import {GraphQLDateTime} from 'graphql-custom-types'

export default new GraphQLObjectType({
  name: 'User',
  description: 'A member',
  fields: () => {
    const {Chapter} = require('src/server/graphql/schemas')

    return {
      id: {type: new GraphQLNonNull(GraphQLID), description: "The user's UUID"},
      chapterId: {type: new GraphQLNonNull(GraphQLID), description: "The user's chapter UUID"},
      chapter: {type: Chapter, description: "The user's chapter"},
      createdAt: {type: new GraphQLNonNull(GraphQLDateTime), description: 'When this record was created'},
      updatedAt: {type: new GraphQLNonNull(GraphQLDateTime), description: 'When this record was last updated'},
    }
  },
})
