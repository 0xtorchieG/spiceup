import { useCallback } from 'react'

const useAuth = () => {
  const signin = useCallback(() => {}, [])

  const signout = useCallback(async () => {}, [])

  return { signin, signout }
}

export default useAuth
