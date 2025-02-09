"use client"

import { AnyUseQueryOptions } from "@tanstack/react-query"
import { ReactNode, createContext } from "react"

export type AuthQueryOptions = {
    queryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    sessionQueryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    tokenQueryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    sessionKey: string[]
    tokenKey: string[]
    listAccountsKey: string[]
    optimisticMutate: boolean
}

export const defaultAuthQueryOptions: AuthQueryOptions = {
    sessionKey: ["session"],
    tokenKey: ["token"],
    listAccountsKey: ["list-accounts"],
    optimisticMutate: true,
}

export const AuthQueryContext = createContext<AuthQueryOptions>(defaultAuthQueryOptions)

export const AuthQueryProvider = ({ children, ...props }: { children: ReactNode } & Partial<AuthQueryOptions>) => {
    return (
        <AuthQueryContext.Provider value={{ ...defaultAuthQueryOptions, ...props }}>
            {children}
        </AuthQueryContext.Provider>
    )
}