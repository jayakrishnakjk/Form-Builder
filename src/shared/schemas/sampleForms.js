import { createBaseField, createEmptyForm } from '../constants/defaults';
import { syncFormFields } from '../utils/formSerializer';

const createNamedField = (type, objectKey, label, overrides = {}) => ({
  ...createBaseField(type),
  objectKey,
  name: objectKey,
  label,
  placeholder: `Enter ${label}`,
  ...overrides,
});

const createFormFromFields = (name, description, fields, metadata = {}) =>
  syncFormFields(
    createEmptyForm({
      name,
      description,
      metadata: {
        category: 'Samples',
        ...metadata,
      },
      layout: {
        id: 'root',
        type: 'root',
        label: 'Root',
        children: fields,
      },
    }),
  );

export const SAMPLE_FORMS = [
  createFormFromFields('Employee Form', 'Employee onboarding and profile capture', [
    createNamedField('heading', 'employeeHeading', 'Employee Details', { defaultValue: 'Employee Details' }),
    createNamedField('text', 'employeeName', 'Employee Name', { required: true }),
    createNamedField('email', 'employeeEmail', 'Employee Email', { validation: { email: true, required: true } }),
    createNamedField('date', 'joiningDate', 'Joining Date'),
  ]),
  createFormFromFields('Registration Form', 'General registration experience', [
    createNamedField('text', 'fullName', 'Full Name', { required: true }),
    createNamedField('phone', 'mobileNumber', 'Mobile Number', { validation: { phone: true } }),
    createNamedField('password', 'password', 'Password', { required: true }),
  ]),
  createFormFromFields('Customer Form', 'Customer profile and segmentation form', [
    createNamedField('text', 'customerName', 'Customer Name'),
    createNamedField('select', 'customerType', 'Customer Type', {
      apiBinding: {
        sourceType: 'static',
        options: [
          { label: 'Retail', value: 'retail' },
          { label: 'Corporate', value: 'corporate' },
          { label: 'Partner', value: 'partner' },
        ],
      },
    }),
    createNamedField('textarea', 'customerNotes', 'Notes'),
  ]),
  createFormFromFields('Hospital Form', 'Patient intake and triage form', [
    createNamedField('text', 'patientName', 'Patient Name'),
    createNamedField('date', 'dob', 'Date of Birth'),
    createNamedField('textarea', 'symptoms', 'Symptoms'),
  ]),
  createFormFromFields('Insurance Form', 'Policy application form', [
    createNamedField('text', 'policyHolder', 'Policy Holder'),
    createNamedField('number', 'insuredAmount', 'Insured Amount', { formula: 'Number(insuredAmount || 0)' }),
    createNamedField('select', 'planType', 'Plan Type'),
  ]),
  createFormFromFields('Bank Form', 'KYC and account opening form', [
    createNamedField('text', 'accountHolder', 'Account Holder'),
    createNamedField('number', 'annualIncome', 'Annual Income'),
    createNamedField('file', 'identityProof', 'Identity Proof'),
  ]),
  createFormFromFields('Student Admission Form', 'Admission intake workflow', [
    createNamedField('text', 'studentName', 'Student Name'),
    createNamedField('select', 'grade', 'Grade'),
    createNamedField('textarea', 'guardianAddress', 'Guardian Address'),
  ]),
  createFormFromFields('Job Application Form', 'Job application capture form', [
    createNamedField('text', 'candidateName', 'Candidate Name'),
    createNamedField('email', 'candidateEmail', 'Candidate Email'),
    createNamedField('file', 'resume', 'Resume Upload'),
  ]),
  createFormFromFields('Feedback Form', 'Customer satisfaction and NPS form', [
    createNamedField('rating', 'serviceRating', 'Service Rating'),
    createNamedField('textarea', 'feedbackComments', 'Comments'),
    createNamedField('switch', 'recommend', 'Would Recommend'),
  ]),
  createFormFromFields('Survey Form', 'Multi-question survey form', [
    createNamedField('radio', 'satisfaction', 'Satisfaction Level', {
      apiBinding: {
        sourceType: 'static',
        options: [
          { label: 'Excellent', value: 'excellent' },
          { label: 'Good', value: 'good' },
          { label: 'Average', value: 'average' },
          { label: 'Poor', value: 'poor' },
        ],
      },
    }),
    createNamedField('multiselect', 'improvements', 'Improvement Areas'),
    createNamedField('signature', 'digitalSignature', 'Digital Signature'),
  ]),
];
