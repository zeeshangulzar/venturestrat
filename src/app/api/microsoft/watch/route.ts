import { NextResponse } from 'next/server'
import { clerkClient, currentUser } from '@clerk/nextjs/server'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function POST(req: Request) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const clientId = process.env.MS_CLIENT_ID
  const clientSecret = process.env.MS_CLIENT_SECRET
  const notificationUrl = process.env.MS_NOTIFICATION_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/microsoft-notification`

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: 'missing_configuration',
        message:
          'MS_CLIENT_ID and MS_CLIENT_SECRET environment variables must be set',
      },
      { status: 500 },
    )
  }

  try {
    const client = await clerkClient()

    const existingMetadata =
      (user.publicMetadata as { msWatchInitialized?: boolean } | undefined) ?? {}

    if (existingMetadata.msWatchInitialized) {
      console.log('Microsoft Graph watch already initialized for user, skipping new watch', {
        userId: user.id,
      })
      return NextResponse.json({ alreadyInitialized: true }, { status: 200 })
    }

    console.log('Microsoft Graph watch request received', {
      userId: user.id,
      notificationUrl,
      clientId: clientId ? 'configured' : 'missing',
      clientSecret: clientSecret ? 'configured' : 'missing',
    })

    let tokensResponse
    try {
      tokensResponse = await client.users.getUserOauthAccessToken(
        user.id,
        'microsoft',
      )
      console.log('Primary Microsoft OAuth token lookup successful')
    } catch (primaryError) {
      console.warn(
        'Primary Microsoft OAuth token lookup failed; retrying with oauth_ prefix',
        primaryError,
      )
      try {
        tokensResponse = await client.users.getUserOauthAccessToken(
          user.id,
          'oauth_microsoft',
        )
        console.log('Fallback Microsoft OAuth token lookup successful')
      } catch (fallbackError) {
        console.error('Both Microsoft OAuth token lookups failed:', fallbackError)
        return NextResponse.json(
          {
            error: 'missing_access_token',
            message: 'No Microsoft OAuth access token found for the current user. Ensure Microsoft OAuth is enabled in Clerk.',
            details: {
              primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError),
              fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
            },
          },
          { status: 400 },
        )
      }
    }

    const oauthAccessToken = tokensResponse?.data?.[0]

    if (!oauthAccessToken?.token) {
      console.error('No Microsoft OAuth access token found in response:', tokensResponse)
      return NextResponse.json(
        {
          error: 'missing_access_token',
          message:
            'No Microsoft OAuth access token found for the current user. Ensure Microsoft OAuth is enabled in Clerk.',
        },
        { status: 400 },
      )
    }

    console.log('Microsoft OAuth access token found, creating subscription...')

    // Create Microsoft Graph subscription for incoming messages only
    const subscriptionData = {
      changeType: 'created',
      notificationUrl: notificationUrl,
      resource: 'me/messages',
      expirationDateTime: new Date(Date.now() + 4230 * 60 * 1000).toISOString(), // ~3 days
      clientState: `secret-${user.id}`,
    }

    console.log('Creating Microsoft Graph subscription with data:', subscriptionData)

    const graphResponse = await fetch(
      'https://graph.microsoft.com/v1.0/subscriptions',
      {
        method: 'POST',
        headers: {
          ...JSON_HEADERS,
          Authorization: `Bearer ${oauthAccessToken.token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(subscriptionData),
      },
    )

    const graphData = await graphResponse
      .json()
      .catch(() => ({ error: 'invalid_json_response' }))

    console.log('Microsoft Graph subscription response:', {
      status: graphResponse.status,
      ok: graphResponse.ok,
      data: graphData,
    })

    if (!graphResponse.ok) {
      console.error('Failed to start Microsoft Graph subscription', {
        status: graphResponse.status,
        statusText: graphResponse.statusText,
        data: graphData,
        subscriptionData,
        notificationUrl,
      })
      return NextResponse.json(
        {
          error: 'microsoft_subscription_failed',
          status: graphResponse.status,
          statusText: graphResponse.statusText,
          details: graphData,
          subscriptionData,
          notificationUrl,
        },
        { status: graphResponse.status },
      )
    }

    console.log('Microsoft Graph subscription started successfully', {
      userId: user.id,
      graphData,
    })

    try {
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          msWatchInitialized: true,
          msSubscriptionId: graphData.id,
          msExpirationDateTime: graphData.expirationDateTime,
        },
      })
    } catch (metadataError) {
      console.error('Failed to update user metadata after Microsoft Graph subscription', metadataError)
    }

    return NextResponse.json(graphData, { status: 200 })
  } catch (error) {
    console.error('Unexpected error creating Microsoft Graph subscription', error)
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Unexpected error while creating Microsoft Graph subscription',
      },
      { status: 500 },
    )
  }
}
