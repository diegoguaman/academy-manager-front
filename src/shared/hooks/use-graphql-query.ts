import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { graphqlRequest } from '@/shared/lib/graphql/client';

export function useGraphQLQuery<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>
>(
  query: string,
  variables?: TVariables,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData>({
    queryKey: [query, variables],
    queryFn: () => graphqlRequest<TData>(query, variables),
    ...options,
  });
}