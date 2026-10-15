import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/db/client';
import { requireSuperAdmin } from '@/lib/auth/authorization';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const project = await prisma.managedProject.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_SYNC_TOKEN;
  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN is not configured.' }, { status: 503 });
  const githubHeaders = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' };
  const dispatchUrl = `https://api.github.com/repos/${project.repository}/actions/workflows/engine-sync.yml/dispatches`;
  const workflow = await readFile(path.join(process.cwd(), '.github/workflows/engine-sync.yml'), 'utf8');
  const workflowFileUrl = `https://api.github.com/repos/${project.repository}/contents/.github/workflows/engine-sync.yml`;
  const existingWorkflow = await fetch(workflowFileUrl, { headers: githubHeaders });
  const existingWorkflowData = existingWorkflow.ok ? await existingWorkflow.json() : null;
  const installResponse = await fetch(workflowFileUrl, {
    method: 'PUT', headers: githubHeaders,
    body: JSON.stringify({ message: 'chore: update Enterprise Engine sync workflow', content: Buffer.from(workflow).toString('base64'), branch: project.branch, ...(existingWorkflowData?.sha ? { sha: existingWorkflowData.sha } : {}) }),
  });
  if (!installResponse.ok && installResponse.status !== 422) {
    const details = await installResponse.text();
    return NextResponse.json({ error: `GitHub rejected workflow installation (${installResponse.status}).`, details }, { status: 502 });
  }
  const dispatch = () => fetch(dispatchUrl, {
    method: 'POST', headers: githubHeaders,
    body: JSON.stringify({ ref: project.branch }),
  });
  let response = await dispatch();
  if (response.status === 404) {
    if (installResponse.ok || installResponse.status === 422) {
      for (let attempt = 0; attempt < 3 && response.status === 404; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = await dispatch();
      }
    } else {
      const details = await installResponse.text();
      return NextResponse.json({ error: `GitHub rejected workflow installation (${installResponse.status}).`, details }, { status: 502 });
    }
  }
  const message = response.ok ? 'Sync workflow dispatched.' : `GitHub rejected the dispatch (${response.status}). The workflow may not exist on the repository default branch.`;
  await prisma.managedProject.update({ where: { id }, data: { lastSyncAt: new Date(), lastSyncStatus: response.ok ? 'queued' : 'failed', lastSyncMessage: message } });
  return NextResponse.json({ message }, { status: response.ok ? 202 : 502 });
}
