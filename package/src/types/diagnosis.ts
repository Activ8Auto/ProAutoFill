export interface DiagnosisEntry {
  id: string;
  user_id: string;
  name: string;
  icd_code: string;
  current_medications: string[];
  physical_exam: string[];
  laboratory_tests: string[];
  teaching_provided: string[]; // Frontend expects this
  medications: string[]; // Frontend expects this
  exclusion_group?: string;
}
