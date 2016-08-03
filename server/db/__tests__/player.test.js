/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, max-nested-callbacks */

import r from '../../../db/connect'
import factory from '../../../test/factories'
import {withDBCleanup} from '../../../test/helpers'

import {
  getPlayerById,
  reassignPlayersToChapter,
  savePlayerProjectStats,
} from '../player'

describe(testContext(__filename), function () {
  withDBCleanup()

  describe('getPlayerById', function () {
    beforeEach(function () {
      return factory.create('player').then(player => {
        this.player = player
      })
    })

    it('returns a shallow player by default', function () {
      return getPlayerById(this.player.id)
        .then(player => {
          expect(player).to.have.property('chapterId')
          expect(player).to.not.have.property('chapter')
        })
    })

    it('merges in the chapter info when requested', function () {
      return getPlayerById(this.player.id, {mergeChapter: true})
        .then(player => {
          expect(player).to.not.have.property('chapterId')
          expect(player).to.have.property('chapter')
          expect(player.chapter).to.have.property('id')
          expect(player.chapter).to.have.property('name')
        })
    })
  })

  describe('reassignPlayersToChapter()', function () {
    beforeEach(function () {
      return Promise.all([
        factory.createMany('player', 2).then(players => {
          this.players = players
          this.playersById = players.reduce((obj, player) => Object.assign(obj, {[player.id]: player}), {})
        }),
        factory.create('chapter').then(c => {
          this.newChapter = c
        }),
      ])
    })

    it('changes the players chapterId & chapterHistory', function () {
      const playerIds = Object.keys(this.playersById)
      return reassignPlayersToChapter(playerIds, this.newChapter.id)
        .then(() => r.table('players').getAll(...playerIds).run())
        .then(players => {
          players.forEach(player => {
            const oldChapterId = this.playersById[player.id].chapterId
            expect(player.chapterId).to.equal(this.newChapter.id)
            expect(player.chapterHistory).to.have.length(1)
            expect(player.chapterHistory[0].chapterId).to.equal(oldChapterId)
          })
        })
    })

    it('returns the new players', function () {
      const playerIds = this.players.map(p => p.id)
      return reassignPlayersToChapter(playerIds, this.newChapter.id).then(result =>
        r.table('players').getAll(...playerIds).run().then(playersFromDB =>
          expect(result).to.deep.equal(playersFromDB)
        )
      )
    })

    it('ignores players already in the given chapter', function () {
      const playerIds = this.players.map(p => p.id)
      expect(
        reassignPlayersToChapter(playerIds, this.players[0].chapterId)
      ).to.eventually.have.length(1)
    })

    it('resolve promise with empty array when no matches', function () {
      expect(
        reassignPlayersToChapter(['not-a-player-id'], this.newChapter.id)
      ).to.eventually.deep.equal([])
    })
  })

  describe('savePlayerProjectStats', function () {
    beforeEach(async function () {
      this.projectIds = [await r.uuid(), await r.uuid()]
      this.cycleIds = [await r.uuid(), await r.uuid()]
      this.player = await factory.create('player', {ecc: 0})
      this.fetchPlayer = () => getPlayerById(this.player.id)
    })

    it('creates the ecc attribute if missing', async function() {
      await getPlayerById(this.player.id).replace(p => p.without('ecc'))

      await savePlayerProjectStats(this.player.id, this.projectIds[0], this.cycleIds[0], {ecc: 40, abc: 4, rc: 10})

      expect(await this.fetchPlayer()).to.have.property('ecc', 40)
    })

    it('adds to the existing ECC', async function() {
      expect(this.player).to.have.property('ecc')
      await getPlayerById(this.player.id).update({ecc: 10})

      await savePlayerProjectStats(this.player.id, this.projectIds[1], this.cycleIds[1], {ecc: 20, abc: 4, rc: 5})

      expect(await this.fetchPlayer()).to.have.property('ecc', 30)
    })

    it('creates the cycleProjectECC attr if neccessary', async function () {
      expect(this.player).to.not.have.property('cycleProjectECC')

      const stats = {ecc: 20, abc: 4, rc: 5}
      await savePlayerProjectStats(this.player.id, this.projectIds[0], this.cycleIds[0], stats)

      expect(await this.fetchPlayer()).to.have.property('cycleProjectECC').and.deep.eq({
        [this.cycleIds[0]]: {[this.projectIds[0]]: stats}
      })
    })

    it('adds an item to the existing cycleProjectECC if needed', async function () {
      expect(this.player).to.not.have.property('cycleProjectECC')

      const stats = [
        {ecc: 20, abc: 4, rc: 5},
        {ecc: 18, abc: 3, rc: 6},
      ]
      await savePlayerProjectStats(this.player.id, this.projectIds[0], this.cycleIds[0], stats[0])
      await savePlayerProjectStats(this.player.id, this.projectIds[1], this.cycleIds[1], stats[1])

      expect(await this.fetchPlayer()).to.have.property('cycleProjectECC').and.deep.eq({
        [this.cycleIds[0]]: {[this.projectIds[0]]: stats[0]},
        [this.cycleIds[1]]: {[this.projectIds[1]]: stats[1]},
      })
    })

    it('adds project ecc to the existing cycleProjectECC item if present', async function () {
      expect(this.player).to.not.have.property('cycleProjectECC')

      const stats = [
        {ecc: 20, abc: 4, rc: 5},
        {ecc: 18, abc: 3, rc: 6},
      ]
      await savePlayerProjectStats(this.player.id, this.projectIds[0], this.cycleIds[0], stats[0])
      await savePlayerProjectStats(this.player.id, this.projectIds[1], this.cycleIds[0], stats[1])

      expect(await this.fetchPlayer()).to.have.property('cycleProjectECC').and.deep.eq({
        [this.cycleIds[0]]: {
          [this.projectIds[0]]: stats[0],
          [this.projectIds[1]]: stats[1],
        },
      })
    })

    it('when called for the same project/cycle more than once, the result is the same as if only the last call were made', async function () {
      // Initialize the player with an ECC of 10
      await savePlayerProjectStats(this.player.id, this.projectIds[0], this.cycleIds[0], {ecc: 10, abc: 2, rc: 5})

      // Add 20 for a project
      await savePlayerProjectStats(this.player.id, this.projectIds[1], this.cycleIds[1], {ecc: 20, abc: 4, rc: 5})
      expect(await this.fetchPlayer()).to.have.property('ecc', 30)
      expect(await this.fetchPlayer()).to.have.deep
        .property(`cycleProjectECC.${this.cycleIds[1]}.${this.projectIds[1]}.ecc`, 20)

      // Change the ECC for that project to 10
      const stats = {ecc: 10, abc: 2, rc: 5}
      await savePlayerProjectStats(this.player.id, this.projectIds[1], this.cycleIds[1], stats)
      expect(await this.fetchPlayer()).to.have.property('ecc', 20)
      expect(await this.fetchPlayer()).to.have.deep
        .property(`cycleProjectECC.${this.cycleIds[1]}.${this.projectIds[1]}`).deep.eq(stats)
    })
  })
})
