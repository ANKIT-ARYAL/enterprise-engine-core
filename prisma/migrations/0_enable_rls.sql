-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Page" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageSection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MediaVault" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomRole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SidebarNav" ENABLE ROW LEVEL SECURITY;

-- Deny all by default (which RLS does when enabled without policies)
-- The Prisma connection using the connection pooler or direct DB connection 
-- (with postgres role) will bypass RLS automatically, ensuring the app works,
-- but the Supabase anonymous REST API will be completely locked out.
