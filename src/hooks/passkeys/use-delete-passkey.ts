import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { PasskeyAuthClient } from "../../types/auth-client"
import type { Passkey } from "../../types/passkey"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useDeletePasskey<TAuthClient extends PasskeyAuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    type DeletePasskeyParams = Parameters<PasskeyAuthClient["passkey"]["deletePasskey"]>[0]

    const { listPasskeysKey: queryKey } = useContext(AuthQueryContext)

    const mutation = useAuthMutation<DeletePasskeyParams, Passkey[]>({
        queryKey,
        mutationFn: ({ fetchOptions = { throw: true }, ...params }) =>
            authClient.passkey.deletePasskey({ fetchOptions, ...params }),
        optimisticData: ({ id }, previousPasskeys) =>
            previousPasskeys.filter((passkey) => passkey.id !== id),
        options
    })

    const {
        mutate: deletePasskey,
        mutateAsync: deletePasskeyAsync,
        isPending: deletePasskeyPending,
        error: deletePasskeyError
    } = mutation

    return {
        ...mutation,
        deletePasskey,
        deletePasskeyAsync,
        deletePasskeyPending,
        deletePasskeyError
    }
}
