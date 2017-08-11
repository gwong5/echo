import r from '../r'

export default function changefeedForChapterCreated() {
  return r.table('members').changes()
    .filter(r.row('old_val').eq(null))
}
