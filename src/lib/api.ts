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
export const fetchUsersList = async (search?: string, page: number = 1, pageSize: number = 20): Promise<{ users: Record<string, unknown>[], total: number, pagination?: Record<string, unknown> }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(), // Backend expects 'limit' instead of 'pageSize'
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

  const data = await response.json();
  return {
    users: data.users || [],
    total: data.pagination?.totalCount || data.users?.length || 0,
    pagination: data.pagination
  };
};

// Function to update user data on the backend
export const updateUserData = async (userId: string, userData: Record<string, unknown>, isComplete: boolean = false): Promise<unknown> => {
  // Extract profile fields, website/logo fields, and business data
  const { firstName, lastName, companyWebsite, companyLogo, ...businessData } = userData;
  
  // Prepare the request body matching backend expectations
  const requestBody = {
    firstname: firstName,  // Backend expects 'firstname' (lowercase)
    lastname: lastName,    // Backend expects 'lastname' (lowercase)
    onboardingComplete: isComplete,  // Separate top-level field
    companyWebsite: companyWebsite,  // Direct field on User model
    companyLogo: companyLogo,        // Direct field on User model
    publicMetaData: {
      ...businessData
      // onboardingComplete removed from publicMetaData
    }
  };

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

// Global rate limiter for API calls
const apiCallQueue = new Map<string, Promise<unknown>>();

// Function to update investor status with rate limiting
export const updateInvestorStatus = async (shortlistId: string, status: string): Promise<unknown> => {
  const key = `${shortlistId}-${status}`;
  
  // If there's already a call in progress for this exact update, return the existing promise
  if (apiCallQueue.has(key)) {
    return apiCallQueue.get(key)!;
  }

  const apiCall = fetch(getApiUrl(`/api/shortlist/${shortlistId}/status`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  }).then(async (response) => {
    // Remove from queue when done
    apiCallQueue.delete(key);
    
    if (!response.ok) {
      throw new Error(`Failed to update investor status: ${response.status}`);
    }

    return response.json();
  }).catch((error) => {
    // Remove from queue on error
    apiCallQueue.delete(key);
    throw error;
  });

  // Store the promise in the queue
  apiCallQueue.set(key, apiCall);
  
  return apiCall;
};

export const fetchSubscription = async (userId: string): Promise<unknown> => {
  const response = await fetch(getApiUrl(`/api/user/${userId}/subscription`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subscription: ${response.status}`);
  }

  return response.json();
};

export const updateSubscriptionPlan = async (
  userId: string,
  plan: string,
  paymentMethodId?: string
): Promise<unknown> => {
  const response = await fetch(getApiUrl(`/api/user/${userId}/subscription`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan,
      ...(paymentMethodId ? { paymentMethodId } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = (errorBody as { error?: string }).error || `Failed to update subscription: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

export const createSubscriptionSetupIntent = async (
  userId: string
): Promise<{ clientSecret: string; stripeCustomerId?: string | null }> => {
  const response = await fetch(getApiUrl(`/api/user/${userId}/subscription/intent`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = (errorBody as { error?: string }).error || `Failed to create setup intent: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json() as Promise<{ clientSecret: string; stripeCustomerId?: string | null }>;
};
