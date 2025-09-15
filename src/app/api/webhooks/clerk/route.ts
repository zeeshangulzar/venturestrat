import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { setDefaultRole } from '@components/_actions'
import { getApiUrl } from '@lib/api'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  // Handle the webhook
  if (eventType === 'user.created') {
    const { id: userId } = evt.data;
    
    // Set default role to moderator for new users
    try {
      await setDefaultRole(userId);
      console.log(`Default role 'moderator' set for new user: ${userId}`);
    } catch (error) {
      console.error('Error setting default role for new user:', error);
    }
  } else if (eventType === 'user.updated') {
    // Handle user updates - this could include role changes
    const { id: userId, public_metadata } = evt.data;
    
    if (public_metadata && public_metadata.role) {
      try {
        // Sync role change to backend
        const backendResponse = await fetch(getApiUrl(`/api/user/${userId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: public_metadata.role
          }),
        });

        if (!backendResponse.ok) {
          console.warn(`Failed to sync role update to backend for user ${userId}: ${backendResponse.status}`);
        } else {
          console.log(`Role update synced to backend for user ${userId}: ${public_metadata.role}`);
        }
      } catch (error) {
        console.error('Error syncing role update to backend:', error);
      }
    }
  }

  return new Response('', { status: 200 })
}
