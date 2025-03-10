import { skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useContext } from "react"
import { AuthQueryContext } from "../../lib/auth-query-provider"
import type { PasskeyAuthClient } from "../../types/auth-client"
import type { Passkey } from "../../types/passkey"
import { useSession } from "../session/use-session"
import { useDeletePasskey } from "./use-delete-passkey"

export function useListPasskeys<TAuthClient extends PasskeyAuthClient>(
    authClient: TAuthClient,
    options?: AnyUseQueryOptions
) {
    const { session } = useSession(authClient)
    const { listPasskeysKey: queryKey, queryOptions } = useContext(AuthQueryContext)
    const mergedOptions = { ...queryOptions, ...options }

    const queryResult = useQuery<Passkey[]>({
        ...mergedOptions,
        queryKey,
        queryFn: session
            ? () => authClient.passkey.listUserPasskeys({ fetchOptions: { throw: true } })
            : skipToken
    })

    const { deletePasskey, deletePasskeyAsync, deletePasskeyPending, deletePasskeyError } =
        useDeletePasskey(authClient)

    return {
        ...queryResult,
        passkeys: queryResult.data,
        deletePasskey,
        deletePasskeyAsync,
        deletePasskeyPending,
        deletePasskeyError
    }
}
