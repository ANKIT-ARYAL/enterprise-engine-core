export interface SystemPermission {
  id: string;
  label: string;
  category: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: SystemPermission[] = [
  { id: 'content:create', label: 'Create Content', category: 'Content Management', description: 'Can create pages, sections, and blogs' },
  { id: 'content:edit', label: 'Edit Content', category: 'Content Management', description: 'Can modify text, images, and layout blocks' },
  { id: 'content:publish', label: 'Publish Content', category: 'Content Management', description: 'Can publish and unpublish live public pages' },
  { id: 'content:delete', label: 'Delete Content', category: 'Content Management', description: 'Can soft delete sections and blog articles' },
  
  { id: 'media:upload', label: 'Upload Media', category: 'Media Vault', description: 'Can upload assets, logos, and images to storage' },
  { id: 'media:manage', label: 'Manage Media', category: 'Media Vault', description: 'Can rename, replace, and organize media vault items' },
  { id: 'media:delete', label: 'Delete Media', category: 'Media Vault', description: 'Can purge assets from the media vault' },
  
  { id: 'settings:general', label: 'General Settings', category: 'System Settings', description: 'Can configure site branding, logo, and title' },
  { id: 'settings:theme', label: 'Theme & Design Studio', category: 'System Settings', description: 'Can edit global colors, fonts, and fluid tokens' },
  { id: 'settings:navigation', label: 'Navigation & Footer', category: 'System Settings', description: 'Can modify public navbars and universal footers' },
  
  { id: 'users:view', label: 'View Users', category: 'Access Control', description: 'Can view team members and user list' },
  { id: 'users:manage', label: 'Manage Roles & RBAC', category: 'Access Control', description: 'Can create and assign custom roles & permissions' },
  { id: 'recycle:restore', label: 'Recycle Recovery', category: 'Maintenance', description: 'Can recover items from the recycle bin' },
  { id: 'recycle:purge', label: 'Permanent Purge', category: 'Maintenance', description: 'Can permanently purge soft-deleted data' },
];
