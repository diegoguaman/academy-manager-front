export const env = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    graphqlUrl:
      process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Academia Multi-Centro',
} as const;