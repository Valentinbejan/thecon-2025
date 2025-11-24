-- 1. Add the email column to the profiles table
alter table public.profiles add column if not exists email text;

-- 2. Backfill email for existing profiles from the auth.users table
update public.profiles
set email = auth.users.email
from auth.users
where public.profiles.id = auth.users.id;

-- 3. Update the trigger function to include email for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$;
