import processChangeFeedWithAutoReconnect from 'rethinkdb-changefeed-reconnect'

import {changefeedForMemberCreated} from 'src/server/services/dataService'
import {handleConnectionError} from './util'

export default function memberCreated(memberCreatedQueue) {
  processChangeFeedWithAutoReconnect(changefeedForMemberCreated, _getFeedProcessor(memberCreatedQueue), handleConnectionError, {
    changefeedName: 'member created'
  })
}

function _getFeedProcessor(memberCreatedQueue) {
  return ({new_val: member}) => {
    const jobOpts = {
      attempts: 3,
      backoff: {type: 'fixed', delay: 5000},
    }
    memberCreatedQueue.add(member, jobOpts)
  }
}
