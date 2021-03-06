import { Prisma, prismaContext, User } from "@trumpsaid/prisma";
import { importSchema } from "graphql-import";
import { applyMiddleware } from "graphql-middleware";
import resolvers from "./resolvers";
import shield from "./Shield";

import { Config } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "graphql-tools";

interface IPassportUser extends User {
  accessToken?: string;
}

const typeDefs = importSchema(__dirname + "/../schema.graphql");

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});
const protectedSchema = applyMiddleware(schema, shield);

interface IExpressContext {
  req: Express.Request;
  res: Express.Response;
}

export interface IApolloContext {
  user: IPassportUser;
  db: Prisma;
}

const apolloConfig: Config = {
  schema: protectedSchema,
  context: (ctx: IExpressContext) => ({
    user: ctx.req.user as IPassportUser,
    db: prismaContext
  })
};

const server = new ApolloServer(apolloConfig);

export default server;
