import profile from '../profile'

const MANDATORY_OBJECTIVES = [
  'AdvancedPlayersTeamCountDoesNotExceedMax',
  'AdvancedPlayersProjectsAllHaveSameGoal',
]

const PRIORITIZED_OBJECTIVES = [
  'TeamSizesMatchRecommendation',
  'NonAdvancedPlayersGotTheirVote',
  'AdvancedPlayersGotTheirVote',
]

export default class ObjectiveAppraiser {
  constructor(pool) {
    this.pool = pool
    this.appraisers = new Map(
      PRIORITIZED_OBJECTIVES.concat(MANDATORY_OBJECTIVES).map(objective => {
        const ObjectiveClass = require(`./${objective}Appraiser`)
        const instance = new ObjectiveClass(pool)
        return [objective, instance]
      }))
  }

  score(teamFormationPlan, {teamsAreIncomplete} = {}) {
    profile.start('ObjectiveAppraiser.score')
    const mandatoryObjectivesScore = this.getScore(MANDATORY_OBJECTIVES, teamFormationPlan)

    if (mandatoryObjectivesScore !== 1) {
      return 0
    }

    const score = this.getScore(PRIORITIZED_OBJECTIVES, teamFormationPlan, {teamsAreIncomplete})

    profile.pause('ObjectiveAppraiser.score')
    return score
  }

  getScore(objectives, teamFormationPlan, {teamsAreIncomplete} = {}) {
    const self = this
    const scores = objectives.map(objective => {
      try {
        profile.start(objective)
        const score = self.appraisers.get(objective).score(teamFormationPlan, {teamsAreIncomplete})
        profile.pause(objective)
        return score
      } catch (err) {
        if (err.code && err.code === 'MODULE_NOT_FOUND') {
          throw new Error(`Could not load project formation algorithm objective [${objective}]: ${err}`)
        }
        throw err
      }
    })
    const rawScore = getWeightedSum(scores)
    const maxPossibleRawScore = getMaxPossibleRawScore(objectives.length)

    return rawScore / maxPossibleRawScore
  }
}

function getMaxPossibleRawScore(scoreCount) {
  return getWeightedSum(Array.from({length: scoreCount}, () => 1))
}

function getWeightedSum(scores) {
  return scores.reduce((sum, next, i, scores) => {
    const weight = Math.pow(10, scores.length - i)
    return sum + (next * weight)
  }, 0)
}