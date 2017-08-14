import {Chapter, Member} from 'src/server/services/dataService'

export default async function upsertMember(values = {}) {
  const {id, inviteCode} = values

  if (!inviteCode) {
    throw new Error(`Invalid invite code for user user with id ${id}; unable to determine chapter assignment`)
  }

  const chapters = await Chapter.getAll(inviteCode, {index: 'inviteCodes'})
  if (chapters.length === 0) {
    throw new Error(`no chapter found with inviteCode ${inviteCode} from user with id ${id}`)
  }

  return Member.upsert({
    id,
    chapterId: chapters[0].id,
  })
}
