alter table storage.buckets add column allowed_mime_types text[] default array[]::text[];

alter table storage.buckets add column avif_autodetection boolean default false;

alter table storage.buckets add column file_size_limit bigint default 0;

alter table storage.buckets add column owner uuid references auth.users on delete cascade;

alter table storage.buckets add column public boolean default false;

alter table storage.buckets add column updated_at timestamptz;

alter table storage.buckets add column created_at timestamptz;

alter table storage.buckets add column owner_id text;

alter table storage.buckets add column version text;

alter table storage.buckets add column download_expiration integer default 30;

alter table storage.buckets add column path_pattern text;

alter table storage.buckets add column search_index_enabled boolean default false;

alter table storage.buckets add column search_vector_enabled boolean default false;

alter table storage.buckets add column presigned_urls_enabled boolean default false;

alter table storage.buckets add column presigned_urls_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_expiry integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_size integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_count integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_age integer default 0;

alter table storage.buckets add column presigned_urls_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max_total_max