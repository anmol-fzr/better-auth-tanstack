export type Passkey = {
    id: string
    name?: string
    publicKey: string
    userId: string
    credentialID: string
    counter: number
    deviceType: string
    backedUp: boolean
    transports?: string
    createdAt: Date
}
