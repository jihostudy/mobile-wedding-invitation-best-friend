begin;

update public.wedding_content
set content = content - 'sampleGuestbookMessages',
    updated_at = now()
where content ? 'sampleGuestbookMessages';

commit;
