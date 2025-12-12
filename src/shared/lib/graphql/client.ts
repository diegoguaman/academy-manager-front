import { GraphQLClient } from 'graphql-request';
import { env } from '@/shared/lib/config/env';

export const graphqlClient = new GraphQLClient(env.graphqlUrl, {
  headers: () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  },
});

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return graphqlClient.request<T>(query, variables);
}