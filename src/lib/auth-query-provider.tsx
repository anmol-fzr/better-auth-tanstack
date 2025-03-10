"use client"

import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { type ReactNode, createContext } from "react"

export type AuthQueryOptions = {
    queryOptions?: AnyUseQueryOptions
    sessionQueryOptions?: AnyUseQueryOptions
    tokenQueryOptions?: AnyUseQueryOptions
    sessionKey: string[]
    tokenKey: string[]
    listAccountsKey: string[]
    listSessionsKey: string[]
    listDeviceSessionsKey: string[]
    listPasskeysKey: string[]
    optimistic: boolean
}

export const defaultAuthQueryOptions: AuthQueryOptions = {
    sessionKey: ["session"],
    tokenKey: ["token"],
    listAccountsKey: ["list-accounts"],
    listSessionsKey: ["list-sessions"],
    listDeviceSessionsKey: ["list-device-sessions"],
    listPasskeysKey: ["list-passkeys"],
    optimistic: true
}

export const AuthQueryContext = createContext<AuthQueryOptions>(defaultAuthQueryOptions)

export const AuthQueryProvider = ({
    children,
    ...props
}: {
    children: ReactNode
} & Partial<AuthQueryOptions>) => {
    return (
        <AuthQueryContext.Provider value={{ ...defaultAuthQueryOptions, ...props }}>
            {children}
        </AuthQueryContext.Provider>
    )
}
