-- Hide internal tables from public GraphQL discovery. RLS already gates rows, this removes schema exposure noise.
REVOKE SELECT ON public.guesty_response_cache FROM anon, authenticated;
REVOKE SELECT ON public.guesty_token_vault FROM anon, authenticated;
REVOKE SELECT ON public.guesty_token_refresh_log FROM anon;
REVOKE SELECT ON public.cms_sync_log FROM anon;

-- Trigger-only functions should not be executable by clients
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_cms_updated_at() FROM anon, authenticated, public;