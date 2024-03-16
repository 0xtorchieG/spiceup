import { Database } from '../../strava-core/db/Database'
import { AuthToken } from './types/Auth'

export class AuthRepository extends Database<AuthToken> {
  public createAuth(authCreation: AuthToken) {
    return this.createEntry('auth', String(authCreation.userId), authCreation, {
      upsert: true,
    })
  }

  public readAuth(userId: string) {
    return this.readEntry('auth', userId)
  }
}
