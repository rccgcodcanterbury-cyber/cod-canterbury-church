-- Church decision (October 2026): enquiry, prayer, first-visit and testimony records are kept.
-- Stop the nightly job that deleted closed records one month after closure.
select cron.unschedule(jobid) from cron.job where jobname = 'purge-expired-church-intake';
