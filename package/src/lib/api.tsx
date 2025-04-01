// lib/api.tsx

import { DiagnosisEntry } from "@/types/diagnosis";

export const getProfiles = async (token: string) => {
  // console.log("Token being sent:", token);
  // console.log("Authorization header:", `Bearer ${token}`);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch profiles");
  }
  return await res.json();
};

export async function createDiagnosis(
  diagnosis: DiagnosisEntry,
  token: string
): Promise<DiagnosisEntry> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagnoses/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(diagnosis),
  });
  if (!res.ok) throw new Error("Failed to create diagnosis");
  return res.json();
}

export async function deleteDiagnosis(id: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/diagnoses/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to delete diagnosis");
  return res.json();
}

export const createProfile = async (profileData: any, token: string) => {
  console.log("API CALL to /profiles with payload:", profileData);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const text = await res.text(); // Read raw response for debugging
    console.log("API response text:", text);

    if (!res.ok) {
      throw new Error(`Failed to create profile: ${res.status} - ${text}`);
    }

    const responseData = JSON.parse(text);
    console.log("Parsed API response:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error in createProfile:", error);
    throw error; // Re-throw to allow caller to handle the error
  }
};

export const deleteProfile = async (id: string, token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to delete profile");
  return await res.json();
};

export async function updateUserDefaults(
  defaultValues: any,
  userId: string,
  token: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/defaults/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ default_values: defaultValues }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update user defaults");
  }
  return await response.json();
}

export async function fetchUserDefaults(userId: string, token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/defaults/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user defaults");
  }
  return await response.json();
}

export async function fetchDiagnosisOptions(
  token: string
): Promise<DiagnosisEntry[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagnoses/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch diagnoses");
  return res.json();
}


export async function updateUserProfileInfo(
  profileInfo: any,
  userId: string,
  token: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/profile-info/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_info: profileInfo }),
    }
  );
  if (!response.ok) throw new Error("Failed to update profile info");
  return await response.json();
}

export async function fetchUserProfileInfo(userId: string, token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/profile-info/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch profile info");
  return await response.json();
}