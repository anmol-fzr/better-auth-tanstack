import { QueryClient } from "@tanstack/react-query"
import { betterAuth } from "better-auth"

export async function prefetchSession<
    TAuth extends ReturnType<typeof betterAuth>
>(
    auth: TAuth,
    queryClient: QueryClient,
    headers: Headers,
    queryKey = ["session"]
) {
    type SessionData = TAuth["$Infer"]["Session"] | null
    type User = TAuth["$Infer"]["Session"]["user"] | undefined
    type Session = TAuth["$Infer"]["Session"]["session"] | undefined

    const data = await auth.api.getSession({ headers }) as SessionData

    await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => data
    })

    return {
        data,
        session: data?.session as Session,
        user: data?.user as User
    }
}