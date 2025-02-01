# @daveyplate/better-auth-tanstack

Tanstack hooks for better-auth session & JWT tokens.

## Prerequisites

First, you need to install [better-auth](https://better-auth.com) and [Tanstack Query](https://tanstack.com/query).

## Installation

```bash
npm install @daveyplate/better-auth-tanstack
```

For the `useSession` hook to refresh on sign in, you must use the `callbackURL` parameter in your `signIn` & `signUp` functions, or manually call `refetch` or `invalidateQueries` for `["session"]`. If you are using Next.js protected middleware routes, `callbackURL` is recommended because it will perform a hard navigation which will clear the router cache.

[@daveyplate/better-auth-ui](https://github.com/daveyplate/better-auth-ui) will handle this for you, it defaults callbackURL to "/", and the `AuthCard` also accepts a `callbackURL` prop.

## Setting up the AuthQueryProvider

First, you need to set up the `AuthQueryProvider` in your application. This provider will supply the necessary context for the hooks to function.

```tsx
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack"

function MyApp({ Component, pageProps }) {
    return (
        <AuthQueryProvider>
            <Component {...pageProps} />
        </AuthQueryProvider>
    )
}

export default MyApp
```

## AuthQueryProvider Props

The `AuthQueryProvider` component accepts the following props. The default `staleTime` for sessions is 30s and for tokens is 60s.

| Prop                  | Type                                                                 | Description                                                                 |
|-----------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `queryOptions`        | `UseQueryOptions`                           | Optional query options for the provider.                                    |
| `sessionQueryOptions` | `UseQueryOptions`                           | Optional query options for the session query.                               |
| `tokenQueryOptions`   | `UseQueryOptions`                           | Optional query options for the token query.                                 |
| `sessionKey`          | `string[]`                                                           | Optional key for the session query. The default is `["session"]`.                                         |
| `tokenKey`            | `string[]`                                                           | Optional key for the token query. The default is `["token"]`.                                           |


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
| options   | UseQueryOptions | Optional query options for the session query.|

#### Example

```tsx
import { useSession } from "./use-auth-hooks"

function MyComponent() {
    const { data: sessionData, session, user, isPending, error } = useSession()

    if (isPending) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return <div>Welcome, {user?.name}</div>
}
```

### useToken

The `useToken` hook is used to fetch the JWT token if better-auth JWT plugin is enabled.

#### Props

| Prop      | Type                                                                 | Description                                  |
|-----------|----------------------------------------------------------------------|----------------------------------------------|
| options   | UseQueryOptions | Optional query options for the token query.  |

#### Example

```tsx
import { useToken } from "./use-auth-hooks"

function MyComponent() {
    const { token, isPending, error } = useToken()

    if (isPending) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return <div>Your token: {token?.token}</div>
}
```

### Prefetch - Advanced Usage
If you want to use a hybrid prefetching strategy, this is totally supported.

### prefetchSession

The `prefetchSession` function is used to prefetch session data and store it in the query client.

#### Props

| Prop    | Type     | Description                      |
|-------------|---------------|-------------------------------------------------------|
| auth    | Auth     | The server auth instance.          |
| queryClient | QueryClient  | The query client instance.              |
| queryKey  | `string[]`  | Optional key for the session query. Default is `["session"]`. |

#### Example


```ts
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"

import { betterAuth } from "better-auth"
import { prefetchSession } from "./lib/prefetch-session"
import { auth } from "@/lib/auth"

async function Page() {
    const queryClient = new QueryClient()

    const { data, session, user } = await prefetchSession(auth, queryClient)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ClientPage />
        </HydrationBoundary>
    )
}
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.