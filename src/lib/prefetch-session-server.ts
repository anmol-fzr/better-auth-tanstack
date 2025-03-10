import type { QueryClient } from "@tanstack/react-query"
import { cache } from "react"
import type { BetterAuth } from "../types/better-auth"

type GetSessionParams = Parameters<BetterAuth["api"]["getSession"]>[0]

const getSession = cache(
    async <TAuth extends BetterAuth>(auth: TAuth, params: GetSessionParams) => {
        type SessionData = TAuth["$Infer"]["Session"] | null

        return (await auth.api.getSession(params)) as SessionData
    }
)

export async function prefetchSession<TAuth extends BetterAuth>(
    auth: TAuth,
    queryClient: QueryClient,
    params: GetSessionParams,
    queryKey = ["session"]
) {
    type SessionData = TAuth["$Infer"]["Session"] | null
    type User = TAuth["$Infer"]["Session"]["user"] | undefined
    type Session = TAuth["$Infer"]["Session"]["session"] | undefined

    const queryFn = async () => (await getSession(auth, params)) as SessionData

    await queryClient.prefetchQuery({ queryKey, queryFn })

    const data = await queryFn()

    return {
        data,
        session: data?.session as Session,
        user: data?.user as User
    }
}
