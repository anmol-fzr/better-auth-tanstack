import { type Query, type QueryKey, useQueryClient } from "@tanstack/react-query"
import { useAuthQueryContext } from "../../lib/auth-query-provider"

export const useOnMutateError = () => {
    const queryClient = useQueryClient()
    const { optimistic } = useAuthQueryContext()

    const onMutateError = (
        error: Error,
        queryKey: QueryKey,
        context?: { previousData?: unknown }
    ) => {
        if (error) {
            console.error(error)
            queryClient
                .getQueryCache()
                .config.onError?.(error, { queryKey } as unknown as Query<unknown, unknown>)
        }

        if (!optimistic || !context?.previousData) return
        queryClient.setQueryData(queryKey, context.previousData)
    }

    return { onMutateError }
}
