import merge from 'lodash/merge'
import { gql } from 'apollo-server-express'
import { buildFederatedSchema } from '@apollo/federation'
import GraphQLDate from 'graphql-date'

import GraphQLJson from '../graphql/GraphQLJson'

import {
  likeQueries,
  likeTypes,
  likeMutations,
} from './like/schema'
import {
  downloadQueries,
  downloadTypes,
  downloadMutations,
} from './download/schema'
import {
  materialQueries,
  materialMutations,
  materialTypes,
} from './material/schema'
import {
  materialGroupMutations,
  materialGroupQueries,
  materialGroupTypes,
} from './materialGroup/schema'
import {
  mockupQueries,
  mockupMutations,
  mockupTypes,
} from './mockup/schema'
import {
  tagQueries,
  tagMutations,
  tagTypes,
} from './tag/schema'
import {
  userMockupQueries,
  userMockupMutations,
  userMockupTypes,
} from './user/schema'
import {
  userCreativeMarketQueries,
  userCreativeMarketMutations,
  userCreativeMarketTypes,
} from './userCreativeMarket/schema'
import {
  userQeaqlQueries,
  userQeaqlMutations,
  userQeaqlTypes,
} from './userQeaql/schema'
import { viewQueries, viewMutations, viewTypes } from './view/schema'
import { counterTypes } from './counter/schema'
import { imageTypes } from './image/schema'
import { previewTypes } from './preview/schema'
import { translationTypes } from './translation/schema'

import { downloadGQLResolvers } from './download/resolvers'
import { likeGQLResolvers } from './like/resolvers'
import { mockupGQLResolvers } from './mockup/resolvers'
import { materialGQLResolvers } from './material/resolvers'
import { materialGroupGQLResolvers } from './materialGroup/resolvers'
import { tagGQLResolvers } from './tag/resolvers'
import { userMockupGQLResolvers } from './user/resolvers'
import { userCreativeMarketGQLResolvers } from './userCreativeMarket/resolvers'
import { userQeaqlGQLResolvers } from './userQeaql/resolvers'
import { viewGQLResolvers } from './view/resolvers'


export const typeDefs = gql`
  scalar Date
  scalar Json

  type Errors {
    errors: Json
  }

  input SizeInput {
    height: Int
    width: Int
    preview: Boolean
  }

  ${counterTypes}
  ${imageTypes}
  ${previewTypes}
  ${translationTypes}

  ${downloadTypes}
  ${likeTypes}
  ${materialTypes}
  ${materialGroupTypes}
  ${mockupTypes}
  ${tagTypes}
  ${userMockupTypes}
  ${userCreativeMarketTypes}
  ${userQeaqlTypes}
  ${viewTypes}

  type Query {
    ${downloadQueries}
    ${likeQueries}
    ${materialQueries}
    ${materialGroupQueries}
    ${mockupQueries}
    ${tagQueries}
    ${userMockupQueries}
    ${userCreativeMarketQueries}
    ${userQeaqlQueries}
    ${viewQueries}
  }

  type Mutation {
    ${downloadMutations}
    ${likeMutations}
    ${materialMutations}
    ${materialGroupMutations}
    ${mockupMutations}
    ${tagMutations}
    ${userMockupMutations}
    ${userCreativeMarketMutations}
    ${userQeaqlMutations}
    ${viewMutations}
  }

  schema {
    query: Query
    mutation: Mutation
  }
`

const rootResolvers = {
  Json: GraphQLJson,
  Date: GraphQLDate,
}

const resolvers = merge(
  rootResolvers,
  downloadGQLResolvers,
  likeGQLResolvers,
  materialGQLResolvers,
  materialGroupGQLResolvers,
  mockupGQLResolvers,
  tagGQLResolvers,
  userMockupGQLResolvers,
  userCreativeMarketGQLResolvers,
  userQeaqlGQLResolvers,
  viewGQLResolvers,
)

// const federatedSchema = makeExecutableSchema({
//   typeDefs,
//   resolvers: rootResolvers,
// })

const federatedSchema = buildFederatedSchema([
  {
    typeDefs,
    resolvers,
  },
])

export default federatedSchema
