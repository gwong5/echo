/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, max-nested-callbacks */
import factory from 'src/test/factories'
import {Member} from 'src/server/services/dataService'
import {resetDB} from 'src/test/helpers'

import upsertMember from '../upsertMember'

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  it('takes a userId and an invite to insert a new member into the database', async function () {
    this.chapter = await factory.create('chapter', {
      inviteCodes: ['test_code']
    })
    await this.chapter.save()
    this.user = await factory.build('user')

    await upsertMember({id: this.user.id, inviteCode: 'test_code'})
    const member = await Member.get(this.user.id)

    expect(member).to.not.be.null
    expect(member.id).to.eql(this.user.id)
    expect(member.chapterId).to.eql(this.chapter.id)
  })

  after(resetDB)
})
