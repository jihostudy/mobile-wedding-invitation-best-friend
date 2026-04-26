-- Remove legacy KakaoPay transfer link fields from stored account content.
update public.wedding_content
set content = jsonb_set(
  content,
  '{accountSection,groups}',
  (
    select coalesce(jsonb_agg(
      jsonb_set(
        account_group.value,
        '{accounts}',
        (
          select coalesce(jsonb_agg(account.value - 'kakaoPayUrl' - 'kakaoPayLink'), '[]'::jsonb)
          from jsonb_array_elements(account_group.value -> 'accounts') as account(value)
        ),
        true
      )
    ), '[]'::jsonb)
    from jsonb_array_elements(content #> '{accountSection,groups}') as account_group(value)
  ),
  true
)
where jsonb_typeof(content #> '{accountSection,groups}') = 'array';
