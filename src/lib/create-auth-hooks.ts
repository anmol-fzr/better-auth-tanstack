import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { createAuthClient } from "better-auth/react"

import { useSession } from "../hooks/use-session"
import { useToken } from "../hooks/use-token"

export function createAuthHooks<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(
    authClient: TAuthClient
) {
    return {
        useSession: (options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">) => {
            return useSession<TAuthClient>(authClient, options)
        },
        useToken: (options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">) => {
            return useToken<TAuthClient>(authClient, options)
        }
    }
}
