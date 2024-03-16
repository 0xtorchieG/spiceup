export type AuthToken = {
  userId: number
  expiresAt: number
  expiresIn: number
  refreshToken: string
  accessToken: string
}
