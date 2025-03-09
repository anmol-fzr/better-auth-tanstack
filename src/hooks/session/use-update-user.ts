import { useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useOnMutateError } from "../shared/use-on-mutate-error"

export function useUpdateUser<TAuthClient extends AuthClient>(
    authClient: TAuthClient
) {
    const queryClient = useQueryClient()

    type SessionData = TAuthClient["$Infer"]["Session"]
    type UpdateUserParams = Parameters<typeof authClient.updateUser>[0]

    const { sessionKey: queryKey, optimistic } = useContext(AuthQueryContext)
    const { onMutateError } = useOnMutateError()

    const mutation = useMutation({
        mutationFn: async (variables: UpdateUserParams) => {
            await new Promise((resolve) => setTimeout(resolve, 3000))

            return await authClient.updateUser({
                fetchOptions: { throw: true },
                ...variables
            })
        },
        onMutate: async (variables) => {
            if (!optimistic) return
            await queryClient.cancelQueries({ queryKey })

            const previousData = queryClient.getQueryData(
                queryKey
            ) as SessionData
            if (!previousData) return

            queryClient.setQueryData(queryKey, {
                ...previousData,
                user: {
                    ...previousData?.user,
                    ...variables
                }
            })

            return { previousData }
        },
        onError: (error, _, context) => onMutateError(error, queryKey, context),
        onSettled: () => queryClient.refetchQueries({ queryKey })
    })

    return {
        ...mutation,
        updateUser: mutation.mutate,
        updateUserAsync: mutation.mutateAsync,
        updateUserPending: mutation.isPending,
        updateUserError: mutation.error
    }
}
