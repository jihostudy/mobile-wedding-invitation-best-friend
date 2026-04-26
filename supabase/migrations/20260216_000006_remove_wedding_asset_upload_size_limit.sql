-- Remove the explicit Supabase Storage size cap for wedding content assets.
update storage.buckets
set file_size_limit = null
where id = 'snap-uploads';

-- Remove outdated size-limit copy from existing snap upload policy text.
with filtered_policy_lines as (
  select
    wc.id,
    coalesce(
      jsonb_agg(item.value order by item.ordinality) filter (
        where item.value <> to_jsonb('업로드 가능한 파일 크기는 사진 1장당 10MB 이하입니다.'::text)
      ),
      '[]'::jsonb
    ) as policy_lines
  from public.wedding_content wc
  cross join lateral jsonb_array_elements(
    wc.content #> '{snapSection,modal,policyLines}'
  ) with ordinality as item(value, ordinality)
  where jsonb_typeof(wc.content #> '{snapSection,modal,policyLines}') = 'array'
  group by wc.id
)
update public.wedding_content wc
set content = jsonb_set(
  wc.content,
  '{snapSection,modal,policyLines}',
  filtered_policy_lines.policy_lines,
  true
)
from filtered_policy_lines
where wc.id = filtered_policy_lines.id;
