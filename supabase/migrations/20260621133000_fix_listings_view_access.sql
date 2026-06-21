-- listings_view exposes property and aggregate availability only.
-- It must be able to aggregate all successful investments and monthly rent
-- without granting members direct access to other members' transaction rows.
alter view public.listings_view set (security_invoker = false);

grant select on public.listings_view to authenticated;
grant select on public.listings_view to service_role;
