import * as yup from 'yup';

export const roleSchema = yup
  .object({
    name: yup.string().required('Role name is required'),
    description: yup.string().nullable(),
    permissionCodes: yup.array().of(yup.string().required()).min(1, 'Select at least one permission'),
  })
  .required();
