import * as Yup from 'yup';

export const CategorySchema = Yup.object().shape({
  categoryName: Yup.string().required('Category name is required').max(255, 'Max 255 characters'),
  description: Yup.string().max(500, 'Max 500 characters').optional(),
  isActive: Yup.boolean().optional(),
});

export const SkillSchema = Yup.object().shape({
  categoryId: Yup.string().uuid('Invalid Category ID').required('Category is required'),
  skillName: Yup.string().required('Skill name is required').max(255, 'Max 255 characters'),
  skillCode: Yup.string().required('Skill code is required').max(50, 'Max 50 characters'),
  requiredCertification: Yup.string().max(255, 'Max 255 characters').optional(),
  description: Yup.string().max(500, 'Max 500 characters').optional(),
  isActive: Yup.boolean().optional(),
});

export const EmployeeSkillSchema = Yup.object().shape({
  skillId: Yup.string().uuid('Invalid Skill ID').required('Skill is required'),
  proficiencyRating: Yup.number()
    .min(0, 'Minimum rating is 0')
    .max(5, 'Maximum rating is 5')
    .required('Rating is required'),
});
