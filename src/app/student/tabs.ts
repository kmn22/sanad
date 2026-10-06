// Kept outside the 'use client' module so server routes can read the values.
export const STUDENT_TABS = ['courses', 'deadlines', 'terms', 'casebook', 'review', 'research'] as const
export type StudentTab = (typeof STUDENT_TABS)[number] | 'overview'
