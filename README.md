# @daveyplate/better-auth-tanstack

Tanstack Query hooks for Better Auth session & JWT token.

More to come soon... (e.g. useListAccounts, SWR port)

## Prerequisites

First, you need to install and integrate [Better Auth](https://better-auth.com) & [Tanstack Query](https://tanstack.com/query).

## Installation

```bash
npm install @daveyplate/better-auth-tanstack
```

For the `useSession` hook to refresh on sign in, sign out, and sign up without email verification, you must manually call `refetch`, `queryClient.invalidateQueries()` for `["session"]`, or `queryClient.clear()` in the `onSuccess` callback of each of those functions or after awaiting and checking for an error.

If you are using Next.js App Router with protected middleware routes, `router.refresh()` is required as well to clear the router cache.

[@daveyplate/better-auth-ui](https://github.com/daveyplate/better-auth-ui) provides an `` prop which is a great place to refetch for all of the auth functions, where it shows `onSessionChange={() => router.refresh()}` in the App Router example.

## Setting up the AuthQueryProvider

First, you need to set up the `AuthQueryProvider` in your application. This provider will supply the necessary context for the hooks to function.

```tsx
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <AuthQueryProvider>
            {children}
        </AuthQueryProvider>
    )
}
```

## AuthQueryProvider Props

The `AuthQueryProvider` component accepts the following props. The default `staleTime` for sessions is 30 seconds and for JWT tokens is 10 minutes.

| Prop                  | Type                                                                 | Description                                                                 |
|-----------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| queryOptions?        | UseQueryOptions                           | Optional query options for the provider.                                    |
| sessionQueryOptions? | UseQueryOptions                           | Optional query options for the session query.                               |
| tokenQueryOptions?   | UseQueryOptions                           | Optional query options for the token query.                                 |
| sessionKey?          | string[]                                                           | Optional key for the session query. The default is `["session"]`.                                         |
| tokenKey?            | string[]                                                           | Optional key for the token query. The default is `["token"]`.                                           |


## Creating `use-auth-hooks.ts`

Create a file named `use-auth-hooks.ts` and set up the hooks using `createAuthHooks` function. This function takes the `authClient` instance and returns the hooks with full type safety and inference from your `authClient`.

```ts
import { createAuthClient } from "better-auth/react"
import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { authClient } from "@/lib/auth-client"

export const { useSession, useToken } = createAuthHooks(authClient)
```

## Using the Hooks

### useSession

The `useSession` hook is used to fetch the session.

#### Props

| Prop      | Type                                                                 | Description                                  |
|-----------|----------------------------------------------------------------------|----------------------------------------------|
| options?   | UseQueryOptions | Optional query options for the session query.|

#### Example

```tsx
import { useSession } from "@/hooks/use-auth-hooks"

function MyComponent() {
    const { data: sessionData, session, user, isPending, refetch } = useSession()

    if (isPending) return <div>Loading...</div>

    return <div>Welcome, {user?.email}</div>
}
```

### useToken

The `useToken` hook is used to fetch the JWT token if better-auth JWT plugin is enabled.

#### Props

| Prop      | Type                                                                 | Description                                  |
|-----------|----------------------------------------------------------------------|----------------------------------------------|
| options?   | UseQueryOptions | Optional query options for the token query.  |

#### Example

```tsx
import { useToken } from "@/hooks/use-auth-hooks"

function MyComponent() {
    const { token, isPending } = useToken()

    if (isPending) return <div>Loading...</div>

    return <div>JWT: {token}</div>
}
```

### Prefetch - Advanced Usage
If you want to use a hybrid prefetching strategy, this is totally supported.

[Tanstack Query - Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)

### prefetchSession

The `prefetchSession` function is used to prefetch session data and store it in the query client.

#### Props

| Prop    | Type     | Description                      |
|-------------|---------------|-------------------------------------------------------|
| auth    | Auth     | The server auth instance.          |
| queryClient | QueryClient  | The query client instance.              |
| headers  | Headers   | The headers object from the server request. |
| queryKey?  | string[]  | Optional key for the session query. Default is `["session"]`. |

#### RSC Example


```ts
import { prefetchSession } from "@daveyplate/better-auth-tanstack/prefetch"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { headers } from "next/headers"

import { betterAuth } from "better-auth"
import { auth } from "@/lib/auth"

export default async function Page() {
    const queryClient = new QueryClient()

    const { data, session, user } = await prefetchSession(
        auth, queryClient, await headers()
    )

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ClientPage />
        </HydrationBoundary>
    )
}
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
