import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

export const resetPasswordSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required')
});
