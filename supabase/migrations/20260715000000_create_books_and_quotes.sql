create table public.books (
  id bigint generated always as identity primary key,
  title text not null unique,
  author text not null
);

create table public.quotes (
  id bigint generated always as identity primary key,
  book_id bigint not null references public.books(id) on delete cascade,
  content text not null,
  constraint quotes_book_content_key unique (book_id, content)
);

alter table public.books enable row level security;
alter table public.quotes enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.books, public.quotes to anon, authenticated;

create policy "Books are publicly readable"
  on public.books
  for select
  to anon, authenticated
  using (true);

create policy "Quotes are publicly readable"
  on public.quotes
  for select
  to anon, authenticated
  using (true);
