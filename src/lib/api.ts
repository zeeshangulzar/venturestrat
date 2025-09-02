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
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return response.json();
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

  const response = await fetch(getApiUrl(`/api/user/${userId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status}`);
  }

  return response.json();
};
