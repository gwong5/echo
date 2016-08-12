import r from 'src/db/connect'

import {lookupChapterId, lookupCycleId, writeCSV, getPlayerInfoByIds} from './util'

export default function requestHandler(req, res) {
  return runReport(req.query, res)
    .then(result => writeCSV(result, res))
}

async function runReport(args) {
  const {cycleNumber, chapterName} = parseArgs(args)

  const chapterId = await lookupChapterId(chapterName)
  const cycleId = await lookupCycleId(chapterId, cycleNumber)

  const playerIds = await r.table('players').filter({chapterId})('id')
  const playerInfo = await getPlayerInfoByIds(playerIds)

  const query = r.expr(playerInfo).do(playerInfoExpr => {
    const getInfo = id => playerInfoExpr(id).default({name: '?', email: '?', handle: '?'})
    return r.table('projects')
      .filter({chapterId})
      .concatMap(row => row('cycleHistory').merge({projectName: row('name')}))
      .filter(row => row('cycleId').eq(cycleId))
      .concatMap(row => row('playerIds')
          .map(id => getInfo(id))
          .merge({
            cycleNumber,
            projectName: row('projectName')
          })
      )
      .merge(row => ({playerId: row('id')})).without('id')
      .orderBy('projectName')
  })

  return await query
}

function parseArgs(args) {
  const requiredArgs = ['cycleNumber', 'chapterName']

  requiredArgs.forEach(arg => {
    if (!args[arg]) {
      throw new Error(`${arg} is a required parameter`)
    }
  })

  return {
    ...args,
    cycleNumber: parseInt(args.cycleNumber, 10),
  }
}
