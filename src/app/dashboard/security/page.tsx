'use client'

import { ProfileView } from '@/components/profile/ProfileView'

export default function DashboardSecurityPage() {
  return <ProfileView isDashboard={true} initialTab="security" showSidebar={false} />
}
