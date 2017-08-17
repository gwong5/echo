/* eslint-env mocha */
/* global expect testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, max-nested-callbacks */
import nock from 'nock'

import config from 'src/config'
import factory from 'src/test/factories'
import {useFixture, resetDB} from 'src/test/helpers'

import {processMemberCreated} from '../memberCreated'

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  describe('processMemberCreated', function () {
    describe('when there is a new member', function () {
      beforeEach(async function () {
        this.chapter = await factory.create('chapter', {
          inviteCodes: ['test']
        })

        this.user = await factory.build('user')
        this.member = await factory.create('member', this.user)

        this.nockGitHub = (user, replyCallback = () => ({})) => {
          nock(config.server.github.baseURL)
            .persist()
            .put(`/teams/${this.chapter.githubTeamId}/memberships/${this.user.handle}`)
            .reply(200, replyCallback)
        }
      })

      it('adds the member to the github team', async function () {
        const replyCallback = arg => {
          expect(arg).to.eql(`/teams/${this.chapter.githubTeamId}/memberships/${this.user.handle}`)
          return JSON.stringify({})
        }
        useFixture.nockClean()
        this.nockGitHub(this.user, replyCallback)
        await useFixture.nockIDMGetUser(this.user)

        await processMemberCreated(this.member)
      })
    })
  })
})
