-- 1. Create a function that runs when a new user signs up
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

-- 2. Create the trigger to call this function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. BACKFILL: Insert profiles for users who already exist but don't have a profile
insert into public.profiles (id, full_name, avatar_url, email)
select id, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url', email
from auth.users
where id not in (select id from public.profiles);
