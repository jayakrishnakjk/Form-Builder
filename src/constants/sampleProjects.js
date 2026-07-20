const dateForDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const SAMPLE_PROJECTS = [
  {
    id: 'project_recruitment_portal',
    name: 'Recruitment Portal',
    url: 'https://company.com/recruitment',
    description: 'Hiring workflows for applications, interviews, offers, and employee transitions.',
    primaryColor: '#6610f2',
    secondaryColor: '#475569',
    logo: '',
    createdAt: dateForDaysAgo(42),
    updatedAt: dateForDaysAgo(8),
    sampleForms: [
      { id: 'sample_employee_registration', name: 'Employee Registration', status: 'published' },
      { id: 'sample_interview_feedback', name: 'Interview Feedback', status: 'published' },
      { id: 'sample_offer_acceptance', name: 'Offer Acceptance', status: 'published' },
      { id: 'sample_candidate_survey', name: 'Candidate Survey', status: 'draft' },
      { id: 'sample_employee_exit', name: 'Employee Exit', status: 'draft' },
    ],
  },
  {
    id: 'project_customer_feedback',
    name: 'Customer Feedback',
    url: 'https://company.com/feedback',
    description: 'Customer satisfaction, product feedback, and service-quality collection.',
    primaryColor: '#7c3aed',
    secondaryColor: '#0f766e',
    logo: '',
    createdAt: dateForDaysAgo(36),
    updatedAt: dateForDaysAgo(6),
    sampleForms: [
      { id: 'sample_nps_survey', name: 'NPS Survey', status: 'published' },
      { id: 'sample_service_feedback', name: 'Service Feedback', status: 'published' },
      { id: 'sample_product_feedback', name: 'Product Feedback', status: 'draft' },
    ],
  },
  {
    id: 'project_hospital_management',
    name: 'Hospital Management',
    url: 'https://hospital.example.com',
    description: 'Patient intake, consent, triage, and discharge form operations.',
    primaryColor: '#0891b2',
    secondaryColor: '#475569',
    logo: '',
    createdAt: dateForDaysAgo(30),
    updatedAt: dateForDaysAgo(3),
    sampleForms: [
      { id: 'sample_patient_intake', name: 'Patient Intake', status: 'published' },
      { id: 'sample_triage_assessment', name: 'Triage Assessment', status: 'published' },
      { id: 'sample_consent_form', name: 'Consent Form', status: 'published' },
      { id: 'sample_discharge_summary', name: 'Discharge Summary', status: 'draft' },
    ],
  },
  {
    id: 'project_school_admission',
    name: 'School Admission',
    url: 'https://school.example.com/admissions',
    description: 'Admission applications and guardian information capture for schools.',
    primaryColor: '#7c3aed',
    secondaryColor: '#4f46e5',
    logo: '',
    createdAt: dateForDaysAgo(22),
    updatedAt: dateForDaysAgo(5),
    sampleForms: [
      { id: 'sample_student_application', name: 'Student Application', status: 'published' },
      { id: 'sample_guardian_details', name: 'Guardian Details', status: 'draft' },
    ],
  },
  {
    id: 'project_loan_application',
    name: 'Loan Application',
    url: 'https://bank.example.com/loans',
    description: 'Loan origination, KYC, document collection, and approval forms.',
    primaryColor: '#f97316',
    secondaryColor: '#475569',
    logo: '',
    createdAt: dateForDaysAgo(18),
    updatedAt: dateForDaysAgo(1),
    sampleForms: [
      { id: 'sample_loan_request', name: 'Loan Request', status: 'published' },
      { id: 'sample_applicant_kyc', name: 'Applicant KYC', status: 'published' },
      { id: 'sample_income_details', name: 'Income Details', status: 'published' },
      { id: 'sample_document_upload', name: 'Document Upload', status: 'published' },
      { id: 'sample_credit_review', name: 'Credit Review', status: 'draft' },
      { id: 'sample_approval_note', name: 'Approval Note', status: 'draft' },
    ],
  },
];
