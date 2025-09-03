// src/lib/api.ts

// Utility function to get the API URL from the environment
export const getApiUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';  // Default to localhost in case env is not set
  return `${baseUrl}${path}`;
};

// Function to fetch user data from the backend
export const fetchUserData = async (userId: string): Promise<unknown> => {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(getApiUrl(`/api/user/${userId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log('Fetch user response:', response);
    
    if (!response.ok) {
      if (response.status === 404) {
        // User doesn't exist in backend yet (new user), return null instead of throwing
        return null;
      }
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Fetch user data timeout:', error);
      // Return null on timeout to allow the app to continue
      return null;
    }
    console.error('Fetch user data error:', error);
    // Return null on any error to prevent the app from hanging
    return null;
  }
};

// Function to update user data on the backend
export const updateUserData = async (userId: string, userData: Record<string, unknown>, isComplete: boolean = false): Promise<unknown> => {
  // Extract profile fields and business data
  const { firstName, lastName, ...businessData } = userData;
  
  // Prepare the request body matching backend expectations
  const requestBody = {
    firstname: firstName,  // Backend expects 'firstname' (lowercase)
    lastname: lastName,    // Backend expects 'lastname' (lowercase)
    onboardingComplete: isComplete,  // Separate top-level field
    publicMetaData: {
      ...businessData
      // onboardingComplete removed from publicMetaData
    }
  };
  
  console.log('Sending to backend:', requestBody);

  // First try to update the user (PUT request)
  let response = await fetch(getApiUrl(`/api/user/${userId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  // If user doesn't exist (404), try to create them (POST request)
  if (!response.ok && response.status === 404) {
    console.log('User not found, creating new user...');
    response = await fetch(getApiUrl(`/api/user/${userId}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  }

  if (!response.ok) {
    throw new Error(`Failed to update/create user: ${response.status}`);
  }

  return response.json();
};
