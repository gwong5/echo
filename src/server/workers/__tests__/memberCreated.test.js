/* eslint-env mocha */
/* global expect, testContext */
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
        this.cycle = await factory.create('cycle', {
          chapterId: this.chapter.id,
          cycleNumber: 3,
        })
        this.user = await factory.build('user')
        this.nockGitHub = (user, replyCallback = () => ({})) => {
          useFixture.nockClean()
          nock(config.server.github.baseURL)
            .persist()
            .put(`/teams/${this.chapter.githubTeamId}/memberships/${user.handle}`)
            .reply(200, replyCallback)
        }
      })

      describe('adds a newly created member to the chapters GitHub Team', function () {
        it('initializes the member', async function () {
          this.nockGitHub(this.user)
          await processMemberCreated(this.user)
        })

        it('adds the member to the github team', async function () {
          const replyCallback = arg => {
            expect(arg).to.eql(`/teams/${this.chapter.githubTeamId}/memberships/${this.user.handle}`)
            return JSON.stringify({})
          }
          this.nockGitHub(this.user, replyCallback)
          await processMemberCreated(this.user)
        })

        // it('inserts the new member into the database', async function () {
        //   this.nockGitHub(this.user)
        //   await processMemberCreated(this.user)
        //   const user = await Member.get(this.user.id)

        //   expect(user).to.not.be.null
        // })

        // it('does not replace the given member if their account already exists', async function () {
        //   this.nockGitHub(this.user)
        //   await processMemberCreated(this.user)
        //   const oldMember = await Member.get(this.user.id)

        //   assert.doesNotThrow(async function () {
        //     await processMemberCreated(this.user)
        //   }, Error)

        //   await processMemberCreated({...this.user, name: 'new name'})
        //   const updatedUser = await Member.get(this.user.id)

        //   expect(updatedUser.createdAt).to.eql(oldMember.createdAt)
        // })
      })
    })
  })
})
