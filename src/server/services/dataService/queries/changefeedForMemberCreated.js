
import r from '../r'

export default function changefeedForMemberCreated() {
  return r.table('members').changes()
    .filter(r.row('old_val').eq(null))
}
