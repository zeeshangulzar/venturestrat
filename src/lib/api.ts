// src/lib/api.ts

// Utility function to get the API URL from the environment
export const getApiUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';  // Default to localhost in case env is not set
  return `${baseUrl}${path}`;
};

// Function to fetch user data from the backend
export const fetchUserData = async (userId: string): Promise<unknown> => {
  const response = await fetch(getApiUrl(`/api/user/${userId}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
console.log('Fetch user response:', response);
  if (!response.ok) {
    if (response.status === 404) {
      // User doesn't exist in backend yet (new user), return null instead of throwing
      return null;
    }
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return response.json();
};

// Function to fetch users list from the backend
export const fetchUsersList = async (search?: string, page: number = 1, pageSize: number = 20): Promise<{ users: any[], total: number }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }

  const response = await fetch(getApiUrl(`/api/users?${params}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  const users = await response.json();
  return {
    users,
    total: users.length // Backend might not return total count
  };
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
