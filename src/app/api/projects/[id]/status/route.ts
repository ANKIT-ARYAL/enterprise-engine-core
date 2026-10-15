import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireSuperAdmin } from '@/lib/auth/authorization';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const project = await prisma.managedProject.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_SYNC_TOKEN;
  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN is not configured.' }, { status: 503 });
  const response = await fetch(`https://api.github.com/repos/${project.repository}/actions/workflows/engine-sync.yml/runs?event=workflow_dispatch&per_page=1`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, cache: 'no-store',
  });
  if (!response.ok) return NextResponse.json({ error: `GitHub status request failed (${response.status}).` }, { status: 502 });
  const run = (await response.json()).workflow_runs?.[0];
  if (!run) return NextResponse.json({ status: project.lastSyncStatus, message: project.lastSyncMessage });
  let status = run.status === 'completed' ? (run.conclusion === 'success' ? 'update_ready' : 'failed') : run.status;
  let message = status === 'failed' ? `GitHub workflow failed. View run: ${run.html_url}` : status === 'update_ready' ? 'Update branch and pull request created.' : `GitHub workflow is ${run.status}.`;
  if (status === 'update_ready') {
    const pullsResponse = await fetch(`https://api.github.com/repos/${project.repository}/pulls?state=all&head=${encodeURIComponent(`${project.repository.split('/')[0]}:chore/enterprise-engine-sync`)}&per_page=1`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, cache: 'no-store' });
    if (pullsResponse.ok) {
      const pull = (await pullsResponse.json())[0];
      if (pull?.merged_at) { status = 'synced'; message = 'Update merged successfully. Project is up to date.'; }
      else if (pull?.state === 'closed') { status = 'failed'; message = `Update pull request was closed without merging: ${pull.html_url}`; }
      else if (pull?.html_url) message = `Update pull request is being merged: ${pull.html_url}`;
    }
  }
  await prisma.managedProject.update({ where: { id }, data: { lastSyncStatus: status, lastSyncMessage: message } });
  return NextResponse.json({ status, message, url: run.html_url });
}
