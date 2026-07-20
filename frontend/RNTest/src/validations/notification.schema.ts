import * as Yup from 'yup';

export const broadcastSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(200, 'Max 200 characters'),
  message: Yup.string().required('Message is required').max(2000, 'Max 2000 characters'),
  type: Yup.string()
    .oneOf(['SYSTEM_ANNOUNCEMENT', 'SECURITY_ALERT'])
    .required('Type is required'),
  target: Yup.string().oneOf(['all', 'selected']).required(),
  employeeIds: Yup.array()
    .of(Yup.string().required())
    .when('target', {
      is: 'selected',
      then: (schema) => schema.min(1, 'Select at least one recipient'),
      otherwise: (schema) => schema.notRequired(),
    }),
});
