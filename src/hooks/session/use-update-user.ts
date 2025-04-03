import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useUpdateUser<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type UpdateUserParams = Parameters<TAuthClient["updateUser"]>[0]

    const { sessionKey: queryKey } = useContext(AuthQueryContext)

    const mutation = useAuthMutation<UpdateUserParams, SessionData>({
        queryKey,
        mutationFn: ({ fetchOptions = { throw: true }, ...params }) =>
            authClient.updateUser({ fetchOptions, ...params }),
        optimisticData: (params, previousSession) => ({
            ...previousSession,
            user: { ...previousSession.user, ...params }
        }),
        options
    })

    const {
        mutate: updateUser,
        mutateAsync: updateUserAsync,
        isPending: updateUserPending,
        error: updateUserError
    } = mutation

    return {
        ...mutation,
        updateUser,
        updateUserAsync,
        updateUserPending,
        updateUserError
    }
}
