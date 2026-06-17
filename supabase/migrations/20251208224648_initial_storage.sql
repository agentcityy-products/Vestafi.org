create policy "Admin can perform all actions w1pnpy_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'payment-proofs'::text) AND (EXISTS ( SELECT 1
   FROM user_role
  WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum))))));


create policy "Admin can perform all actions w1pnpy_1"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'payment-proofs'::text) AND (EXISTS ( SELECT 1
   FROM user_role
  WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum))))));


create policy "Admin can perform all actions w1pnpy_2"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'payment-proofs'::text) AND (EXISTS ( SELECT 1
   FROM user_role
  WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum))))));


create policy "Admin can perform all actions w1pnpy_3"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'payment-proofs'::text) AND (EXISTS ( SELECT 1
   FROM user_role
  WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum))))));


create policy "Anyone can view property images"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'property-images'::text));


create policy "Give insert and view access to own folder w1pnpy_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'payment-proofs'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give insert and view access to own folder w1pnpy_1"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'payment-proofs'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Only admins can modify property images"
on "storage"."objects"
as permissive
for all
to public
using (((bucket_id = 'property-images'::text) AND (EXISTS ( SELECT 1
   FROM user_role
  WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum))))))
with check (((bucket_id = 'property-images'::text) AND (EXISTS ( SELECT 1
   FROM user_role
  WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum))))));


create policy "checking 1nktv5h_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'investment-receipts'::text));


create policy "checking 1nktv5h_1"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'investment-receipts'::text));


create policy "checking 1nktv5h_2"
on "storage"."objects"
as permissive
for update
to public
using ((bucket_id = 'investment-receipts'::text));


create policy "checking 1nktv5h_3"
on "storage"."objects"
as permissive
for delete
to public
using ((bucket_id = 'investment-receipts'::text));



