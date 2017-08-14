/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, max-nested-callbacks */
import nock from 'nock'
import {mockIdmGetUser} from 'src/test/helpers'

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

        // this.cycle = await factory.create('cycle', {
        //   chapterId: this.chapter.id,
        //   cycleNumber: 3,
        // })

        this.user = await factory.build('user')
        
        this.member = {id: this.user.id, chapterId: this.chapter.id}

        console.log('member in test : ', this.member)
        
        this.nockGitHub = (user, replyCallback = () => ({})) => {
          useFixture.nockClean()
          nock(config.server.github.baseURL)
            .persist()
            .put(`/teams/${this.chapter.githubTeamId}/memberships/${user.handle}`)
            .reply(200, replyCallback)
        }
      })

      it('adds the member to the github team', async function () {
        const user = this.user
          const replyCallback = arg => {
            expect(arg).to.eql(`/teams/${this.chapter.githubTeamId}/memberships/${user.handle}`)
            return JSON.stringify({})
          }
          mockIdmGetUser(this.user.id,{handle: this.user.handle})
          this.nockGitHub(this.user, replyCallback)
          await processMemberCreated(this.member)
        })
      })
    })
  })
