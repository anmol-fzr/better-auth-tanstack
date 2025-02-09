"use client"

import { AnyUseQueryOptions } from "@tanstack/react-query"
import { ReactNode, createContext } from "react"

export type AuthQueryOptions = {
    queryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    sessionQueryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    tokenQueryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    sessionKey?: string[]
    tokenKey?: string[]
    optimisticMutate?: boolean
}

export const defaultAuthQueryOptions: AuthQueryOptions = {
    queryOptions: {},
    sessionQueryOptions: {},
    tokenQueryOptions: {},
    sessionKey: ["session"],
    tokenKey: ["token"],
    optimisticMutate: true,
}

export const AuthQueryContext = createContext<AuthQueryOptions>({})

export const AuthQueryProvider = ({ children, ...props }: { children: ReactNode } & AuthQueryOptions) => {
    return (
        <AuthQueryContext.Provider value={{ ...defaultAuthQueryOptions, ...props }}>
            {children}
        </AuthQueryContext.Provider>
    )
}