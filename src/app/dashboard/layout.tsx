import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | SkillBridge',
  description: 'Manage your active learning programs, track your progress, and view your project submissions.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
