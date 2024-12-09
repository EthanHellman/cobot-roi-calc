const JOBS_STORAGE_KEY = 'weld-jobs';

// Add proper typing instead of any
import { WeldJob } from '@/types/weld-jobs';

export const saveJobsToStorage = (jobs: WeldJob[]) => {
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  } catch (error) {
    console.error('Error saving jobs to storage:', error);
  }
};

export const loadJobsFromStorage = () => {
  try {
    const storedJobs = localStorage.getItem(JOBS_STORAGE_KEY);
    return storedJobs ? JSON.parse(storedJobs) : [];
  } catch (error) {
    console.error('Error loading jobs from storage:', error);
    return [];
  }
};