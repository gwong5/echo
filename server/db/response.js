import r from '../../db/connect'
import {validateResponse} from '../../common/models/response'
import {getQuestionById} from './question'

export function saveResponsesForQuestion(responses) {
  return insert(responses)
    .then(result => result.generated_keys)
    // TODO:
    // * handle errors!!
    // * check for duplicate responses and throw error or update
    // * validate responses (% sum === 100, etc)
}

function insert(one_or_more_responses) {
  const responses = Array.isArray(one_or_more_responses)
    ? one_or_more_responses
    : [one_or_more_responses]

  const responsesWithTimestampts = responses.map(response => Object.assign({}, response, {
    updatedAt: r.now(),
    createdAt: r.now(),
  }))
  return r.table('responses').insert(responsesWithTimestampts).run()
}
