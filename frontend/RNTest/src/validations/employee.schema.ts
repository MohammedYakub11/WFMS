import * as yup from 'yup';

export const employeeSchema = yup
  .object({
    employee_code: yup.string().required('Employee code is required'),
    first_name: yup.string().required('First name is required'),
    last_name: yup.string().required('Last name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    phone: yup.string().nullable(),
    designation: yup.string().nullable(),
    department: yup.string().nullable(),
    location: yup.string().nullable(),
    experience: yup
      .number()
      .typeError('Must be a number')
      .min(0, 'Cannot be negative')
      .nullable()
      .transform((v, o) => (o === '' ? null : v)),
    reportingManagerId: yup.string().nullable(),
  })
  .required();

// Password not editable via the generic update form — see UpdateEmployeeInput.
export const employeeEditSchema = employeeSchema.omit(['password']);
