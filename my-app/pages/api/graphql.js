import { gql, ApolloServer } from 'apollo-server-micro';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'

import neo4j from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql';

const typeDefs = `#graphql
    type Movie {
        title: String
        actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN)
        categories: [Category!]! @relationship(type: "HAS_CATEGORY", direction: OUT)
    }
        
    type Actor {
        name: String
        age: Int
        nationality: String
        movies: [Movie!]! @relationship(type: "ACTED_IN", direction: OUT)
    }

    type Category {
        name: String
        category: [Category!]! @relationship(type: "HAS_CATEGORY", direction: IN)
    }
`;


const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
)

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const apolloServer = new ApolloServer({
    schema: await neoSchema.getSchema(),
    playground: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground]
});

const startServer = apolloServer.start();

export default async function handler(req, res) {
    await startServer;

    await apolloServer.createHandler({
        path: "/api/graphql"
    })(req, res);
}

export const config = {
    api: {
        bodyParser: false
    }
}