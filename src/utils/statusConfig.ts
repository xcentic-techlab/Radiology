export const statusColorMap = {
  // Report statuses
  created: { bg: 'bg-secondary', text: 'text-secondary-foreground', label: 'Created' },
  in_progress: { bg: 'bg-accent', text: 'text-accent-foreground', label: 'In Progress' },
  report_uploaded: { bg: 'bg-primary', text: 'text-primary-foreground', label: 'Report Uploaded' },
  reviewed: { bg: 'bg-warning', text: 'text-warning-foreground', label: 'Reviewed' },
  approved: { bg: 'bg-success', text: 'text-success-foreground', label: 'Approved' },
  cancelled: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Cancelled' },
  paid: { bg: 'bg-success', text: 'text-success-foreground', label: 'Paid' },

  // Payment statuses
  pending: { bg: 'bg-warning', text: 'text-warning-foreground', label: 'Pending' },
  success: { bg: 'bg-success', text: 'text-success-foreground', label: 'Success' },
  failed: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Failed' },
  refunded: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Refunded' },
};

export const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  reception: 'Reception',
  department_user: 'Department User',
  patient: 'Patient',
};

export const paymentMethodLabels = {
  cash: 'Cash',
  card: 'Card',
  online: 'Online',
  insurance: 'Insurance',
};
