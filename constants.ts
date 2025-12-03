
import { Project, ProjectStatus, User, UserRole } from './types';

export const INITIAL_PROJECTS: Project[] = [
  // --- FETS APPS ---
  {
    id: 'fets-hub',
    name: 'FETS HUB',
    description: 'Centralized command center for Forun Educational & Testing Services. Manage exam schedules, client resources, and developer tools.',
    status: ProjectStatus.COMPLETED,
    websiteUrl: 'https://fets.hub',
    repoUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80', // Office/Hub vibe
    techStack: ['React', 'Vite', 'Tailwind CSS'],
    files: 'src/\n  components/\n    Dashboard.tsx\n    ResourceView.tsx',
    createdAt: Date.now(),
    itemType: 'app'
  },
  {
    id: 'fets-live',
    name: 'fets.live',
    description: 'Real-time proctoring and educational streaming platform. Delivers secure, low-latency video feeds for remote exam monitoring.',
    status: ProjectStatus.IN_PROGRESS,
    websiteUrl: 'https://fets.live',
    repoUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80', // Conference/Streaming vibe
    techStack: ['WebRTC', 'Node.js', 'Socket.io'],
    files: 'server/\n  signaling.ts\nclient/\n  ProctorView.tsx',
    createdAt: Date.now() - 1000000,
    itemType: 'app'
  },
  {
    id: 'fets-team',
    name: 'fets.team',
    description: 'Internal collaboration and HR portal for Forun staff, proctors, and administrators. Manage shifts, payroll, and compliance.',
    status: ProjectStatus.COMPLETED,
    websiteUrl: 'https://fets.team',
    repoUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80', // Office/Team vibe
    techStack: ['Next.js', 'PostgreSQL', 'Prisma'],
    files: 'pages/\n  roster.tsx\n  payroll.tsx',
    createdAt: Date.now() - 2000000,
    itemType: 'app'
  },
  {
    id: 'fets-cloud',
    name: 'fets.cloud',
    description: 'Scalable cloud infrastructure dashboard managing exam delivery instances and secure record storage.',
    status: ProjectStatus.COMPLETED,
    websiteUrl: 'https://fets.cloud',
    repoUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80', // Cloud/Tech vibe
    techStack: ['AWS', 'Docker', 'Kubernetes'],
    files: 'infra/\n  terraform/\n    main.tf\n  k8s/\n    deployment.yaml',
    createdAt: Date.now() - 3000000,
    itemType: 'app'
  },
  {
    id: 'fets-cash',
    name: 'fets.cash',
    description: 'Secure payment gateway and financial transaction management system for examination fees and booking settlements.',
    status: ProjectStatus.IN_PROGRESS,
    websiteUrl: 'https://fets.cash',
    repoUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1600&q=80', // Finance vibe
    techStack: ['Stripe API', 'Express', 'React'],
    files: 'api/\n  payments.ts\n  webhooks.ts',
    createdAt: Date.now() - 4000000,
    itemType: 'app'
  },

  // --- CLIENT PORTALS (AS APPS) ---
  {
    id: 'prometric-portal',
    name: 'Prometric Portal',
    description: 'Candidate scheduling and result management for Prometric exams.',
    status: ProjectStatus.COMPLETED,
    websiteUrl: 'https://www.prometric.com',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80', // Professional testing vibe
    techStack: ['External', 'Portal'],
    files: 'N/A - External Link',
    createdAt: Date.now() - 5000000,
    itemType: 'app'
  },
  {
    id: 'pearson-portal',
    name: 'Pearson VUE Navigator',
    description: 'Access to Pearson VUE testing systems for administrators and test centers.',
    status: ProjectStatus.COMPLETED,
    websiteUrl: 'https://home.pearsonvue.com',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80', // Corporate/Meeting vibe
    techStack: ['External', 'Portal'],
    files: 'N/A - External Link',
    createdAt: Date.now() - 6000000,
    itemType: 'app'
  },
  {
    id: 'psi-portal',
    name: 'PSI Atlas',
    description: 'PSI licensure and certification exam delivery platform.',
    status: ProjectStatus.COMPLETED,
    websiteUrl: 'https://www.psiexams.com',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1600&q=80', // Legal/Exam vibe
    techStack: ['External', 'Portal'],
    files: 'N/A - External Link',
    createdAt: Date.now() - 7000000,
    itemType: 'app'
  },

  // --- RESOURCES / FILES ---
  {
    id: 'cert-cma',
    name: 'CMA USA Handbook',
    description: 'Certified Management Accountant (CMA) exam content outlines and candidate rules.',
    status: ProjectStatus.COMPLETED,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80', // Finance/Accounting
    techStack: ['PDF', 'Prometric', 'Finance'],
    files: 'docs/\n  CMA_Handbook_2025.pdf',
    createdAt: Date.now() - 100000,
    itemType: 'file'
  },
  {
    id: 'cert-ms',
    name: 'Microsoft Cert Guidelines',
    description: 'Role-based certification paths for Azure, Microsoft 365, and Dynamics.',
    status: ProjectStatus.COMPLETED,
    imageUrl: 'https://images.unsplash.com/photo-1633419461186-7d75fc07612d?auto=format&fit=crop&w=1600&q=80', // Microsoft/Tech
    techStack: ['PDF', 'Pearson VUE', 'IT'],
    files: 'docs/\n  MS_Cert_Path_2025.pdf',
    createdAt: Date.now() - 200000,
    itemType: 'file'
  },
  {
    id: 'cert-rcs',
    name: 'RCS England Protocols',
    description: 'Royal College of Surgeons exam delivery standards and surgical assessment criteria.',
    status: ProjectStatus.COMPLETED,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80', // Medical
    techStack: ['PDF', 'Pearson VUE', 'Medical'],
    files: 'docs/\n  RCS_Exam_Regulations.pdf',
    createdAt: Date.now() - 300000,
    itemType: 'file'
  },
  {
    id: 'cert-aws',
    name: 'AWS Security Standards',
    description: 'Compliance requirements for hosting AWS certification exams via fets.cloud.',
    status: ProjectStatus.COMPLETED,
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80', // Security/Cloud
    techStack: ['PDF', 'AWS', 'Security'],
    files: 'docs/\n  AWS_Facility_Reqs.pdf',
    createdAt: Date.now() - 400000,
    itemType: 'file'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@fets.dev',
    role: UserRole.ADMIN,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  },
  {
    id: '2',
    name: 'Lead Proctor',
    email: 'proctor@fets.dev',
    role: UserRole.DEVELOPER,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Proctor'
  },
  {
    id: '3',
    name: 'Center Manager',
    email: 'manager@fets.dev',
    role: UserRole.EDITOR,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager'
  }
];

export const NOTIFICATIONS = [
  {
    id: 1,
    text: "Upcoming maintenance window for fets.cloud",
    time: "2 hours ago",
    isNew: true
  },
  {
    id: 2,
    text: "New CMA USA exam schedules uploaded.",
    time: "1 day ago",
    isNew: false
  },
  {
    id: 3,
    text: "fets.live deployment successful (v2.1.0)",
    time: "2 days ago",
    isNew: false
  }
];
