import {getCycleById, getLatestCycleForChapter} from 'src/server/db/cycle'
import r from 'src/db/connect'

export default async function getCycleVotingResults(chapterId, cycleId) {
  const cycle = cycleId ?
    await getCycleById(cycleId, {mergeChapter: true}) :
    await getLatestCycleForChapter(chapterId, {mergeChapter: true})

  const numEligiblePlayers = await r.table('players')
    .getAll(cycle.chapter.id, {index: 'chapterId'})
    .count()
    .run()

  const validVotesQuery = r.table('votes')
    .getAll(cycle.id, {index: 'cycleId'})
    .hasFields('goals')

  const numVotes = await validVotesQuery.count().run()

  const candidateGoals = await validVotesQuery
    .group(r.row('goals').pluck('url', 'title'), {multi: true})
    .ungroup()
    .map(doc => {
      return {
        goal: doc('group'),
        playerGoalRanks: doc('reduction').map(vote => {
          return {
            playerId: vote('playerId'),
            goalRank: vote('goals')('url').offsetsOf(doc('group')('url')).nth(0)
          }
        })
      }
    })
    .orderBy(r.desc(r.row('playerGoalRanks').count()))
    .run()

  return {
    id: 'cycleVotingResults',
    cycle,
    numEligiblePlayers,
    numVotes,
    candidateGoals,
  }
}
