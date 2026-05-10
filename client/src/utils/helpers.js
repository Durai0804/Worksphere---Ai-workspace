export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'status-active', inactive: 'status-inactive', present: 'status-present',
    absent: 'status-absent', late: 'status-late', pending: 'status-pending',
    approved: 'status-approved', rejected: 'status-rejected', 'on-leave': 'status-pending',
    'half-day': 'status-late',
  };
  return colors[status] || 'status-pending';
};

export const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Finance', 'Human Resources', 'Management', 'Sales', 'Operations'];
export const ROLES = ['admin', 'hr', 'employee'];
