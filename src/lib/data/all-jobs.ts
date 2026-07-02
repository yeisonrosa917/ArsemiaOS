import { jobs as MOCK_JOBS } from "@/lib/mock-data";
import { SCHEDULE_JOBS } from "@/lib/seeds/schedule";

/**
 * The full operating schedule: the hand-written mock jobs (rich detail, used by
 * existing flows) plus the generated April→September schedule. Operational
 * surfaces (Jobs, Dispatch, Foremen, Dashboard, Analytics) and the jobs store
 * read from here so history and future bookings show consistently everywhere.
 */
export const allJobs = [...MOCK_JOBS, ...SCHEDULE_JOBS];
