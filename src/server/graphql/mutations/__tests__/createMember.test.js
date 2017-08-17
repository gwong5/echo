/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLMutation} from 'src/test/helpers'

import fields from '../index'

const query = `
mutation($id: ID!, $inviteCode: String!) { 
  createMember(id: $id, inviteCode: $inviteCode) {
    id
    chapterId
}}`

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  describe('createMember', function () {
    beforeEach('create a member with admin role and user with member role', async function () {
      this.adminUser = await factory.build('user', {roles: ['admin']})
      this.user = await factory.build('user', {roles: ['member']})
      this.adminMember = await factory.build('member', {id: this.adminUser.id})
      this.chapter = await factory.build('chapter', {inviteCodes: ['test']})
      await this.chapter.save()
    })

    before(function () {
      this.createMember = function (id, inviteCode) {
        return runGraphQLMutation(
          query,
          fields,
          {id, inviteCode},
          {currentUser: this.adminUser},
        )
      }
    })
    it('creates a new member', async function () {
      const {id} = this.user
      const inviteCode = 'test'
      const result = await this.createMember(id, inviteCode)
      const newMember = result.data.createMember

      expect(newMember).to.have.property('id').eq(id)
    })
  })
})
