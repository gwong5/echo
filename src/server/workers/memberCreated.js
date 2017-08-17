import {addUserToTeam} from 'src/server/services/gitHubService'
import {logRejection} from 'src/server/util'
// import getSingleUser from 'src/server/actions/getSingleUser'
import getUser from 'src/server/actions/getUser'
import {Chapter} from 'src/server/services/dataService'

export function start() {
  const jobService = require('src/server/services/jobService')
  jobService.processJobs('memberCreated', processMemberCreated)
}

export async function processMemberCreated(member) {
  const {handle} = await getUser(member.id)

  try {
    const {githubTeamId} = await Chapter.get(member.chapterId)

    if (!githubTeamId) {
      throw new Error(`No githubTeamId found for chapter with chapterId ${member.chapterId}`)
    }

    try {
      await _addUserToChapterGitHubTeam(handle, githubTeamId)
    } catch (err) {
      console.error(`Unable to add member ${member.id} to github team ${githubTeamId}: ${err}`)
    }
  } catch (err) {
    throw new Error(`Unable to save user updates ${member.id}: ${err}`)
  }
}

async function _addUserToChapterGitHubTeam(handle, githubTeamId) {
  console.log(`Adding ${handle} to GitHub team ${githubTeamId}`)
  return logRejection(addUserToTeam(handle, githubTeamId), 'Error while adding user to chapter GitHub team.')
}
