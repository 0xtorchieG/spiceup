import { Database } from '../../strava-core/db/Database'
import { User } from './types/User'

export class UserRepository extends Database<User> {
  public createUser(userCreation: User) {
    return this.createEntry('users', userCreation.id, userCreation)
  }

  public readUser(id: string) {
    return this.readEntry('users', id)
  }
}
