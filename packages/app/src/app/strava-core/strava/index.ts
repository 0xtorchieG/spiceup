import appStrava from 'strava-v3'

appStrava.config({
  access_token: '',
  client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
  client_secret: process.env.STRAVA_CLIENT_SECRET!,
  redirect_uri: process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI!,
})

export default appStrava
