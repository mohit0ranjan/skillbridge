const resolveApiBase = () => {
  const configured = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (configured) return configured;

  // Keep localhost fallback for local development only.
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5000';
  }

  return '';
};

export const API_BASE = resolveApiBase();

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sb_token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError('API base URL is not configured. Set NEXT_PUBLIC_API_URL.', 500);
    }

    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const rawBody = await response.text();
    let json: any = null;

    if (rawBody) {
      if (contentType.includes('application/json')) {
        try {
          json = JSON.parse(rawBody);
        } catch {
          json = null;
        }
      } else {
        try {
          json = JSON.parse(rawBody);
        } catch {
          json = { message: rawBody };
        }
      }
    } else {
      json = {};
    }

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_user');
      }

      if (response.status === 401) {
        throw new ApiError('Session expired. Please login again.', response.status, json);
      }

      // Backend sends { message, details } on validation errors
      let msg = json.message || 'Request failed';
      if (json.details) {
        if (Array.isArray(json.details)) {
          msg = json.details.map((d: { field: string; message: string }) => d.message).join('. ');
        } else if (typeof json.details === 'string') {
          msg = `${msg}: ${json.details}`;
        }
      }

      throw new ApiError(msg, response.status, json);
    }

    // Backend wraps all responses in { success, data, message } envelope — unwrap it
    const payload = json.data !== undefined ? json.data : json;
    return payload as T;
  }

  // Auth
  async signup(body: { name: string; email: string; password: string; college?: string; year?: string }) {
    return this.request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) });
  }

  async login(body: { email: string; password: string }) {
    return this.request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  }

  async getMe() {
    return this.request<UserProfile>('/auth/me');
  }

  // Internships
  async getInternships() {
    return this.request<any[]>('/internships');
  }

  // Enrollment
  async enroll(internshipId: string) {
    return this.request<any>('/enroll', { method: 'POST', body: JSON.stringify({ internshipId }) });
  }

  // Dashboard
  async getDashboard() {
    return this.request<DashboardData>('/dashboard');
  }

  async getMyInternships() {
    return this.request<any[]>('/my-internships');
  }

  async getAdminDashboard() {
    return this.request<AdminDashboardData>('/admin/dashboard');
  }

  async getAdminSubmissions(filters?: { status?: string; internshipId?: string }) {
    const query = new URLSearchParams();
    if (filters?.status) query.set('status', filters.status);
    if (filters?.internshipId) query.set('internshipId', filters.internshipId);
    const queryString = query.toString();
    return this.request<AdminSubmission[]>(`/admin/submissions${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminInternshipAnalytics(internshipId: string) {
    return this.request<any>(`/admin/internship/${internshipId}/analytics`);
  }

  async getAdminUser(userId: string) {
    return this.request<AdminUserDetail>(`/admin/user/${userId}`);
  }

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
    return this.request<any>(`/admin/user/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async reviewFinalSubmission(submissionId: string, body: { status: 'APPROVED' | 'REJECTED'; feedback?: string }) {
    return this.request<any>(`/admin/final-submission/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async getAdminTickets(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<Ticket[]>(`/admin/tickets${query}`);
  }

  async getAdminCertificates() {
    return this.request<AdminCertificate[]>('/admin/certificates');
  }

  async updateAdminTicketStatus(ticketId: string, status: string) {
    return this.request<any>(`/admin/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async replyToAdminTicket(ticketId: string, reply: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' = 'RESOLVED') {
    return this.request<any>('/admin/tickets/reply', {
      method: 'POST',
      body: JSON.stringify({ ticketId, reply, status }),
    });
  }

  // Tasks
  async getTasks(internshipId: string) {
    return this.request<any[]>(`/tasks/${internshipId}`);
  }

  async getLearningPlan(internshipId: string) {
    return this.request<LearningPlan>(`/learning-plan/${internshipId}`);
  }

  async submitTask(taskId: string, githubLink: string) {
    return this.request<any>('/submit-task', { method: 'POST', body: JSON.stringify({ taskId, githubLink }) });
  }

  async markWeekComplete(body: { internshipId: string; weekNumber: number }) {
    return this.request<any>('/learning-progress', { method: 'PATCH', body: JSON.stringify(body) });
  }

  async submitProject(body: { internshipId: string; projectTitle: string; projectLink: string; description: string; fileUrl?: string | null }) {
    return this.request<any>('/submit-project', { method: 'POST', body: JSON.stringify(body) });
  }

  // Certificates
  async generateCertificate(internshipId: string) {
    return this.request<any>('/generate-certificate', { method: 'POST', body: JSON.stringify({ internshipId }) });
  }

  async verifyCertificate(certificateId: string) {
    return this.request<CertificateVerification>(`/verify/${certificateId}`);
  }

  // Payments
  async createOrder(amount: number, certificateId?: string, internshipId?: string, internshipMeta?: InternshipOrderMeta) {
    return this.request<OrderResponse>('/create-order', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        certificateId,
        internshipId,
        internshipTitle: internshipMeta?.title,
        internshipDomain: internshipMeta?.domain,
        internshipDuration: internshipMeta?.duration,
        internshipLevel: internshipMeta?.level,
        internshipDescription: internshipMeta?.description,
      })
    });
  }

  async verifyPayment(body: PaymentVerification) {
    return this.request<any>('/verify-payment', { method: 'POST', body: JSON.stringify(body) });
  }

  async markPaymentFailed(body: PaymentFailurePayload) {
    return this.request<any>('/payment-failed', { method: 'POST', body: JSON.stringify(body) });
  }

  // Tickets
  async createTicket(subject: string, message: string) {
    return this.request<any>('/ticket', { method: 'POST', body: JSON.stringify({ subject, message }) });
  }

  async getTickets() {
    return this.request<Ticket[]>('/tickets');
  }
}

// Error class
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Types
export type AuthResponse = {
  id: string;
  name: string;
  email: string;
  college?: string;
  year?: string;
  role: string;
  emailVerified?: boolean;
  token: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  year?: string;
  emailVerified?: boolean;
};

export type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  enrollments: Array<{
    id: string;
    internshipId: string;
    internship: string;
    domain: string;
    duration: string;
    status: string;
    progress: number;
    completedWeeks: number;
    totalWeeks: number;
    tasksSummary: {
      total: number;
      submitted: number;
      approved: number;
    };
    tasks: Array<{
      id: string;
      title: string;
      week: number;
      status: string;
      submissionStatus: string | null;
      feedback: string | null;
    }>;
    certificate: {
      id: string;
      certificateId: string;
      isPaid: boolean;
      issuedDate: string;
    } | null;
    enrolledAt: string;
    weeks?: Array<{
      week: number;
      title: string;
      description: string;
      resources: string[];
      tasks: Array<{
        id: string;
        title: string;
        description: string;
      }>;
    }>;
    finalSubmission?: {
      id: string;
      projectTitle: string;
      projectLink: string;
      description: string;
      fileUrl?: string | null;
      status: string;
      submittedAt: string;
    } | null;
  }>;
  recentActivity: Array<{
    text: string;
    time: string;
    status: string;
  }>;
};

export type LearningPlan = {
  internship: {
    id: string;
    title: string;
    domain: string;
    duration: string;
    level: string;
  };
  weeks: Array<{
    week: number;
    title: string;
    description: string;
    resources: string[];
    tasks: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  }>;
  progress: number;
  completedWeeks: number;
  totalWeeks: number;
  finalSubmission: {
    id: string;
    projectTitle: string;
    projectLink: string;
    description: string;
    fileUrl?: string | null;
    status: string;
    submittedAt: string;
  } | null;
  certificate: {
    id: string;
    certificateId: string;
    isPaid: boolean;
    issuedDate: string;
  } | null;
};

export type CertificateVerification = {
  valid: boolean;
  studentName?: string;
  college?: string;
  internship?: string;
  issueDate?: string;
  certificateId?: string;
  message?: string;
};

export type OrderResponse = {
  orderId: string;
  paymentId: string;
  amount: number;
  internshipId?: string;
};

export type InternshipOrderMeta = {
  title: string;
  domain: string;
  duration: string;
  level: string;
  description?: string;
};

export type PaymentVerification = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  paymentId: string;
  internshipId?: string;
};

export type PaymentFailurePayload = {
  razorpay_order_id: string;
  paymentId: string;
  internshipId?: string;
  reason?: string;
  certificateId?: string;
};

export type AdminDashboardData = {
  users: {
    total: number;
    admins: number;
    students: number;
  };
  programs: {
    total: number;
    enrollments: number;
    avgEnrollmentPerProgram: number;
  };
  submissions: {
    pending: number;
  };
  certificates: {
    paid: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
};

export type AdminSubmission = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    college?: string | null;
  };
  task: {
    id: string;
    title: string;
    internshipId: string;
    week: number;
  };
  githubLink: string;
  status: string;
  feedback?: string | null;
  createdAt: string;
};

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  college?: string | null;
  year?: string | null;
  role: string;
  internships: Array<{
    internship: { id: string; title: string; domain: string };
  }>;
  submissions: Array<{
    task: { id: string; title: string };
  }>;
  finalSubmissions?: Array<{
    id: string;
    projectTitle: string;
    projectLink: string;
    description: string;
    status: string;
    feedback?: string | null;
    submittedAt: string;
    internship: { id: string; title: string; domain: string };
  }>;
  certificates: Array<{
    certificateId: string;
    internship: { title: string };
  }>;
  payments: Array<any>;
};

export type Ticket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  replyMessage?: string | null;
  repliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCertificate = {
  id: string;
  certificateId: string;
  studentName: string;
  email: string;
  college?: string | null;
  internship: string;
  domain: string;
  issuedDate: string;
  isPaid: boolean;
  viewUrl: string;
  downloadUrl: string;
};

export const api = new ApiClient();
