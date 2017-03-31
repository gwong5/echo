/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */

import nock from 'nock'

import config from 'src/config'
import stubs from 'src/test/stubs'
import {useFixture} from 'src/test/helpers'

describe(testContext(__filename), function () {
  beforeEach(function () {
    useFixture.nockClean()
    this.responses = {}
    this.apiScope = nock(config.server.chat.baseURL)
    stubs.jobService.enable()
  })
  afterEach(function () {
    stubs.jobService.disable()
  })

  describe('chatService', function () {
    const {createChannel} = require('../index')

    describe('createChannel()', function () {
      beforeEach(function () {
        this.name = 'perfect-penguin'
        this.topic = '[Goal 1: lorem ipsum](http://example.com)'
        this.members = ['echo']
        this.responses.createChannel = {
          id: 'BFWXgKacy8e4vjXJL',
          name: this.name,
          members: this.members,
          topic: this.topic,
        }
        this.apiScope
          .post('/api/channels.create')
          .reply(200, {
            channel: this.responses.createChannel,
          })
          .post('/api/channels.setTopic')
          .reply(200, {
            ok: true,
            topic: this.topic,
          })
          .post('/api/channels.invite')
          .reply(200, {
            channel: this.responses.createChannel,
            members: this.members,
          })
      })

      it('returns the parsed response on success', function () {
        const result = createChannel(this.name, this.members, this.topic)
        return expect(result).to.eventually.deep.equal(this.responses.createChannel)
      })
    })
  })
})