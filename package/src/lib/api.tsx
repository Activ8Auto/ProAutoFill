// lib/api.tsx

import { DiagnosisEntry } from "@/types/diagnosis";

export const getProfiles = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles`);
  if (!res.ok) {
    throw new Error("Failed to fetch profiles");
  }
  return await res.json();
};

export async function fetchDiagnosisOptions(): Promise<DiagnosisEntry[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/diagnoses`;
  console.log("Fetching diagnoses from:", url);
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Fetch failed with status:", res.status, res.statusText);
    throw new Error("Failed to fetch diagnoses");
  }
  const data = await res.json();
  console.log("Raw fetched diagnoses:", data);

  // Map backend field names to frontend expectations
  const mappedData = data.map((diagnosis: any) => ({
    ...diagnosis,
    teaching_provided: diagnosis.teachings, // Map "teachings" to "teaching_provided"
    medications: diagnosis.prescribed_medications, // Map "prescribed_medications" to "medications"
    teachings: undefined, // Remove the original field
    prescribed_medications: undefined, // Remove the original field
  }));

  console.log("Mapped diagnoses:", mappedData);
  return mappedData;
}

export async function createDiagnosis(
  diagnosis: DiagnosisEntry & { user_id: string }
): Promise<DiagnosisEntry> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagnoses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(diagnosis),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error("Server validation error:", errorData);
    throw new Error("Failed to create diagnosis");
  }
  return res.json();
}

export async function deleteDiagnosis(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/diagnoses/${id}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Failed to delete diagnosis");
  return res.json();
}

export const createProfile = async (profileData: any) => {
  console.log("API CALL to /profiles with payload:", profileData);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  const text = await res.text(); // read raw response for debugging
  console.log("API response text:", text);

  if (!res.ok) {
    throw new Error(`Failed to create profile: ${text}`);
  }

  return JSON.parse(text);
};

export const deleteProfile = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete profile");
  }
  return await res.json();
};
export async function updateUserDefaults(defaultValues: any, userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/defaults`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ default_values: defaultValues }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update user defaults");
  }
  return await response.json();
}

export async function fetchUserDefaults(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/defaults`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user defaults");
  }
  return await response.json();
}
