export type Project = {
  id: string;
  projectName: string;
  company: string;
  project_no: string;
  startDate: string;
  endDate?: string;
  technician: string;
  status: string;
  site_name?: string;
  site_email?: string;
  location_id?: string;
  pm_id?: string;
  technician_ids?: string[];
  customer_id?: string;
};
