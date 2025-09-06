import { type QueryKey, skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import type { BetterFetchOption, BetterFetchResponse } from "better-auth/react"

import { useAuthQueryContext } from "../../lib/auth-query-provider"
import type { AnyAuthClient } from "../../types/any-auth-client"
import { useSession } from "../session/use-session"

export type BetterFetchRequest<TData> = ({
    fetchOptions
}: { fetchOptions: BetterFetchOption }) => Promise<BetterFetchResponse<TData>>

type UseAuthQueryProps<TData, TAuthClient> = {
    authClient: TAuthClient
    queryKey: QueryKey
    queryFn: BetterFetchRequest<TData>
    options?: Partial<AnyUseQueryOptions>
}

export function useAuthQuery<TData, TAuthClient extends AnyAuthClient = AnyAuthClient>({
    authClient,
    queryKey,
    queryFn,
    options
}: UseAuthQueryProps<TData, TAuthClient>) {
    const { data: sessionData } = useSession(authClient)
    const { queryOptions } = useAuthQueryContext()
    const mergedOptions = { ...queryOptions, ...options }

    return useQuery<TData>({
        queryKey,
        queryFn: sessionData ? () => queryFn({ fetchOptions: { throw: true } }) : skipToken,
        ...mergedOptions
    })
}
