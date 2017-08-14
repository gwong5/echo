import nock from 'nock'

import config from 'src/config'
import factory from 'src/test/factories'

export async function mockIdmUsersById(userIds = [], overwriteObjs = null, options = {}) {
  const overwriteObjectAttributes = overwriteObjs ? overwriteObjs : userIds.map(id => ({id}))
  const idmUsers = await factory.buildMany('user', overwriteObjectAttributes)
  nock(config.server.idm.baseURL)
    .post('/graphql')
    .times(isNaN(options.times) ? 1 : options.times)
    .reply(200, function (uri, requestBody = {}) { // eslint-disable-line prefer-arrow-callback
      let matchedUsers
      if (options.strict) {
        const {variables: {ids, identifiers}} = requestBody
        const inputIds = ids || identifiers || []
        matchedUsers = idmUsers.filter(u => inputIds.includes(u.id))
      } else {
        matchedUsers = idmUsers
      }
      return JSON.stringify({data: {
        getUsersByIds: matchedUsers,
        findUsers: matchedUsers,
      }})
    })
  return idmUsers
}

export async function mockIdmGetUser(userId, overwriteObjectAttributes = {}, options = {}) {
  const idmUser = await factory.build('user', {id: userId, ...overwriteObjectAttributes})
  console.log('IDM BASE URL ', config.server.idm.baseURL)
  nock(config.server.idm.baseURL)
    .post('/graphql')
    .times(isNaN(options.times) ? 1 : options.times)
    .reply(200, function () { // eslint-disable-line prefer-arrow-callback
      return JSON.stringify({data: {getUser: idmUser}})
    })
  return idmUser
}
