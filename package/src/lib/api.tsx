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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
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

  const data = await res.json();
  // Transform the response to match the frontend keys:
  const transformedData: DiagnosisEntry[] = data.map((item: any) => ({
    id: item.id,
    name: item.name,
    icd_code: item.icd_code,
    exclusion_group: item.exclusion_group,
    // Use the pre-serialized arrays from the backend:
    current_medications: item.current_medications || [],
    // Here we map the backend's "prescribed_medications" to "medications"
    medications: item.prescribed_medications || [],
    // Map teachings to "teaching_provided"
    teaching_provided: item.teachings || [],
    // Map laboratory_tests and physical_exams (or physical_exam) accordingly
    laboratory_tests: item.laboratory_tests || [],
    physical_exam: item.physical_exams || [],
  }));
  return transformedData;
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

export const getAutomationRuns = async (token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/runs/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const error = new Error(`HTTP error! status: ${res.status}`);
    (error as any).status = res.status; // Attach status to error
    throw error;
  }
  return res.json();
};

export const updateProfile = async (
  profileId: string,
  updates: any,
  token: string
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/profiles/${profileId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update profile failed:", errorText);
    throw new Error("Failed to update profile");
  }

  return await res.json();
};

export async function updateDiagnosis(
  diagnosisId: string,
  diagnosis: Partial<DiagnosisEntry>,
  token: string
): Promise<DiagnosisEntry> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/diagnoses/${diagnosisId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(diagnosis),
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update diagnosis: ${res.status} - ${errorText}`);
  }
  const data = await res.json();
  // Transform the response to match DiagnosisEntry
  return {
    id: data.id,
    name: data.name,
    icd_code: data.icd_code,
    exclusion_group: data.exclusion_group,
    current_medications: data.current_medications || [],
    medications: data.prescribed_medications || [],
    teaching_provided: data.teachings || [],
    laboratory_tests: data.laboratory_tests || [],
    physical_exam: data.physical_exam || [],
    user_id: data.user_id,
  };
}

export const getErrorLogs = async (token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/runs/errors`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch error logs");
  }
  return res.json();
};

export const clearErrorLogs = async (token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/runs/errors`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to clear error logs: ${res.status} - ${errorText}`);
  }
  return res.json();
};

export const createCheckoutSession = async (token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to create checkout session: ${res.status} - ${errorText}`
    );
  }
  return await res.json(); // Returns { checkout_url: "https://checkout.stripe.com/..." }
};

export async function fetchRemainingRuns(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/runs/remaining`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch remaining runs");
  }

  return res.json();
}
