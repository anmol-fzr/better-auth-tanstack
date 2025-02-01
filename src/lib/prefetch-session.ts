import { QueryClient } from "@tanstack/react-query"
import { betterAuth } from "better-auth"
import { headers } from "next/headers"

export async function prefetchSession<
    TAuth extends ReturnType<typeof betterAuth>
>(
    auth: TAuth,
    queryClient: QueryClient,
    queryKey = ["session"]
) {
    type SessionData = TAuth["$Infer"]["Session"] | null
    type User = TAuth["$Infer"]["Session"]["user"] | null
    type Session = TAuth["$Infer"]["Session"]["session"] | null

    const data = await auth.api.getSession({
        headers: await headers()
    }) as SessionData

    await queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
            return data
        }
    })

    return {
        data,
        session: data?.session as Session,
        user: data?.user as User
    }
}