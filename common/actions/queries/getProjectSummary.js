import {STAT_DESCRIPTORS} from 'src/common/models/stat'

export default function getProjectSummary(identifier) {
  return {
    variables: {identifier},
    query: `query ($identifier: String!) {
      getProjectSummary(identifier: $identifier) {
        project {
          id
          name
          artifactURL
          createdAt
          updatedAt
          closedAt
          state
          coach {
            id
            handle
          }
          goal {
            number
            title
            level
            url
          }
          stats {
            ${STAT_DESCRIPTORS.PROJECT_COMPLETENESS}
            ${STAT_DESCRIPTORS.PROJECT_HOURS}
          }
          chapter {
            id
            name
          }
          cycle {
            id
            cycleNumber
            state
            startTimestamp
            endTimestamp
          }
        }
        projectEvaluations {
          createdAt
          submittedBy {
            id
            handle
            name
          }
          ${STAT_DESCRIPTORS.PROJECT_COMPLETENESS}
        }
        projectUserSummaries {
          user {
            id
            name
            handle
            avatarUrl
          }
          userProjectEvaluations {
            ${STAT_DESCRIPTORS.GENERAL_FEEDBACK}
          }
          userProjectStats {
            ${STAT_DESCRIPTORS.CHALLENGE}
            ${STAT_DESCRIPTORS.ELO}
            ${STAT_DESCRIPTORS.ESTIMATION_ACCURACY}
            ${STAT_DESCRIPTORS.ESTIMATION_BIAS}
            ${STAT_DESCRIPTORS.EXPERIENCE_POINTS}
            ${STAT_DESCRIPTORS.EXPERIENCE_POINTS_V2}
            ${STAT_DESCRIPTORS.EXPERIENCE_POINTS_V2_PACE}
            ${STAT_DESCRIPTORS.LEVEL} {
              starting
              ending
            }
            ${STAT_DESCRIPTORS.PROJECT_HOURS}
            ${STAT_DESCRIPTORS.RELATIVE_CONTRIBUTION}
          }
          userRetrospectiveComplete
          userRetrospectiveUnlocked
        }
      }
    }`,
  }
}
