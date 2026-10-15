import ProjectsManager from '@/components/admin/ProjectsManager';
import { prisma } from '@/lib/db/client';
import { requireSuperAdmin } from '@/lib/auth/authorization';

export const instant = false;

export default async function ProjectsPage() {
  await requireSuperAdmin();
  const projects = await prisma.managedProject.findMany({ orderBy: { createdAt: 'desc' } });
  return <ProjectsManager initialProjects={projects.map((project) => ({ ...project, lastSyncAt: project.lastSyncAt?.toISOString() ?? null, createdAt: project.createdAt.toISOString() }))} />;
}
