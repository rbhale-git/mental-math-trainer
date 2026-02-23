-- ============================================================
-- Add "lives" as a valid session mode
-- ============================================================

alter table sessions
  drop constraint if exists sessions_mode_check;

alter table sessions
  add constraint sessions_mode_check
  check (mode in ('unlimited', 'timed', 'lives'));
