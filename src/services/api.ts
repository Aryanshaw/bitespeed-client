const BASE_URL = 'https://aryan-bitespeed.onrender.com/api';

export interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

export interface ContactResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: string[];
  };
}

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export const identifyContact = async (data: IdentifyRequest): Promise<ContactResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};