import { NextResponse } from 'next/server'
import { clerkClient, currentUser } from '@clerk/nextjs/server'

type WatchRequest = {
  labelIds?: string[]
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function POST(req: Request) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const projectId = process.env.YOUR_PROJECT_ID
  const topicName = process.env.YOUR_TOPIC_NAME

  if (!projectId || !topicName) {
    return NextResponse.json(
      {
        error: 'missing_configuration',
        message:
          'YOUR_PROJECT_ID and YOUR_TOPIC_NAME environment variables must be set',
      },
      { status: 500 },
    )
  }

  let body: WatchRequest = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const labelIds =
    Array.isArray(body.labelIds) && body.labelIds.length > 0
      ? body.labelIds
      : ['INBOX']

  try {
    const client = await clerkClient()

    const existingMetadata =
      (user.publicMetadata as { gmailWatchInitialized?: boolean } | undefined) ?? {}

    if (existingMetadata.gmailWatchInitialized) {
      console.log('Gmail watch already initialized for user, skipping new watch', {
        userId: user.id,
      })
      return NextResponse.json({ alreadyInitialized: true }, { status: 200 })
    }

    console.log('Gmail watch request received', {
      userId: user.id,
      labelIds,
      configuredTopic: topicName,
      configuredProject: projectId,
    })

    let tokensResponse
    try {
      tokensResponse = await client.users.getUserOauthAccessToken(
        user.id,
        'google',
      )
    } catch (primaryError) {
      console.warn(
        'Primary Google OAuth token lookup failed; retrying with oauth_ prefix',
        primaryError,
      )
      tokensResponse = await client.users.getUserOauthAccessToken(
        user.id,
        'oauth_google',
      )
    }

    const oauthAccessToken = tokensResponse?.data?.[0]

    if (!oauthAccessToken?.token) {
      return NextResponse.json(
        {
          error: 'missing_access_token',
          message:
            'No Google OAuth access token found for the current user. Ensure Google OAuth is enabled in Clerk.',
        },
        { status: 400 },
      )
    }

    const fullTopicName = topicName.startsWith('projects/')
      ? topicName
      : `projects/${projectId}/topics/${topicName}`

    const gmailResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/watch',
      {
        method: 'POST',
        headers: {
          ...JSON_HEADERS,
          Authorization: `Bearer ${oauthAccessToken.token}`,
        },
        body: JSON.stringify({
          topicName: fullTopicName,
          labelIds,
        }),
      },
    )

    const gmailData = await gmailResponse
      .json()
      .catch(() => ({ error: 'invalid_json_response' }))

    if (!gmailResponse.ok) {
      console.error('Failed to start Gmail watch', gmailData)
      return NextResponse.json(
        {
          error: 'gmail_watch_failed',
          status: gmailResponse.status,
          details: gmailData,
        },
        { status: gmailResponse.status },
      )
    }

    console.log('Gmail watch started successfully', {
      userId: user.id,
      gmailData,
    })

    try {
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          gmailWatchInitialized: true,
          gmailWatchHistoryId: gmailData.historyId,
          gmailWatchExpiration: gmailData.expiration,
        },
      })
    } catch (metadataError) {
      console.error('Failed to update user metadata after Gmail watch', metadataError)
    }

    return NextResponse.json(gmailData, { status: 200 })
  } catch (error) {
    console.error('Unexpected error creating Gmail watch', error)
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Unexpected error while creating Gmail watch',
      },
      { status: 500 },
    )
  }
}
