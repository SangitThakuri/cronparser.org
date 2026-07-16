export interface CodeExample {
  label: string
  code: string
}

export interface PlatformFaq {
  q: string
  a: string
}

export interface PlatformGuide {
  slug: string
  title: string
  metaDescription: string
  h1: string
  category: string
  intro: string
  syntaxNotes: string
  codeExamples: CodeExample[]
  gotchas: string[]
  bestPractices: string[]
  faqs: PlatformFaq[]
}

export const PLATFORM_GUIDES: PlatformGuide[] = [
  {
    slug: "linux-cron",
    title: "Linux Cron Guide — Crontab Syntax & Examples | CronParser",
    metaDescription:
      "How to schedule jobs with cron on Linux: crontab -e, standard 5-field syntax, log locations, and common gotchas. Complete guide with examples.",
    h1: "Linux Cron Guide",
    category: "Operating System",
    intro:
      "Cron is the standard job scheduler on nearly every Linux distribution, implemented as a daemon (crond) that wakes up every minute and checks each user's crontab for matching entries. It's been part of Unix since the 1970s and its 5-field syntax is the reference implementation that every other platform on this list either uses directly or adapts.",
    syntaxNotes:
      "Standard 5-field format: minute, hour, day-of-month, month, day-of-week. Most Linux distributions ship Vixie cron or a compatible fork (cronie), both of which also support @nicknames (@daily, @reboot, etc.) and environment variable assignments at the top of the crontab.",
    codeExamples: [
      { label: "Edit your personal crontab", code: "crontab -e" },
      { label: "List your current crontab", code: "crontab -l" },
      { label: "Run a backup script every night at 2 AM", code: "0 2 * * * /home/user/scripts/backup.sh >> /var/log/backup.log 2>&1" },
    ],
    gotchas: [
      "Cron jobs run with a minimal environment — no PATH beyond /usr/bin:/bin by default, so scripts that work fine in an interactive shell can fail silently under cron. Always use absolute paths or set PATH explicitly in the crontab.",
      "Output isn't shown anywhere by default — redirect stdout and stderr to a log file (>> log.txt 2>&1), or cron will try to email it (and silently drop it if no mail transport agent is configured).",
      "System-wide crontabs (/etc/crontab, /etc/cron.d/*) require an extra username field between the schedule and the command — a common source of 'my cron job never runs' bugs when copying a user crontab entry into a system one.",
    ],
    bestPractices: [
      "Always redirect output explicitly and rotate the log file, rather than relying on cron's mail-based error reporting.",
      "Use full absolute paths for both the command and any files it references, since cron's working directory and PATH aren't the same as your login shell's.",
      "Check /var/log/syslog or /var/log/cron (distro-dependent) when a job doesn't seem to run — cron logs every invocation attempt there.",
    ],
    faqs: [
      {
        q: "Where are user crontabs stored?",
        a: "Typically in /var/spool/cron/crontabs/<username> (Debian/Ubuntu) or /var/spool/cron/<username> (RHEL/CentOS). Always edit them with crontab -e rather than directly, so the cron daemon picks up changes correctly.",
      },
      {
        q: "What's the difference between a user crontab and /etc/crontab?",
        a: "A user crontab (edited via crontab -e) always runs as that user and has 5 fields. /etc/crontab and files in /etc/cron.d/ are system-wide and require a 6th field specifying which user to run as.",
      },
      {
        q: "Does cron run if the system is off at the scheduled time?",
        a: "No — standard cron requires the machine to be running at the exact scheduled minute. For laptops or machines that sleep, anacron (which catches up missed daily/weekly/monthly jobs on next boot) is the common complement.",
      },
    ],
  },
  {
    slug: "ubuntu-cron",
    title: "Ubuntu Cron Guide — Setup, Syntax & Common Issues | CronParser",
    metaDescription:
      "Set up and troubleshoot cron jobs on Ubuntu: installing cron, systemd service commands, crontab -e, and Ubuntu-specific gotchas.",
    h1: "Ubuntu Cron Guide",
    category: "Operating System",
    intro:
      "Ubuntu ships with cron (the cron package, built on Vixie cron) pre-installed and enabled on server and most desktop installs, managed as a systemd service. The scheduling syntax is identical standard 5-field cron, but Ubuntu's systemd integration and default package layout have a few of their own operational details worth knowing.",
    syntaxNotes:
      "Same standard 5-field syntax as any Linux cron. The practical differences on Ubuntu are around service management (systemd) and default file locations, not the schedule syntax itself.",
    codeExamples: [
      { label: "Check that cron is running", code: "systemctl status cron" },
      { label: "Restart the cron service after editing /etc/crontab", code: "sudo systemctl restart cron" },
      { label: "Edit your crontab (opens nano by default)", code: "crontab -e" },
    ],
    gotchas: [
      "Ubuntu's default crontab editor is nano, not vi — if you expect vi/vim keybindings, run `select-editor` once to change the default, or `EDITOR=vim crontab -e` for a one-off.",
      "Minimal/server Ubuntu installs (and some cloud images) don't always have cron installed by default — check with `dpkg -l | grep cron` and `sudo apt install cron` if it's missing.",
      "Snap-packaged applications run in a confined environment and may not see the same filesystem paths as a regular cron job — if a cron job needs to interact with a snap's data, check the snap's specific data directory conventions.",
    ],
    bestPractices: [
      "Use `systemctl status cron` as your first troubleshooting step — if the service isn't active, no crontab entry will ever fire regardless of syntax.",
      "For Ubuntu Server cloud images (AWS, DigitalOcean, etc.), verify the system timezone with `timedatectl` before assuming cron runs in your local time — cloud images frequently default to UTC.",
      "Prefer `/etc/cron.d/` drop-in files over editing `/etc/crontab` directly for system-wide jobs installed by scripts or configuration management (Ansible, etc.) — it avoids merge conflicts with manual edits.",
    ],
    faqs: [
      {
        q: "Is cron pre-installed on Ubuntu?",
        a: "On Ubuntu Desktop and most Ubuntu Server ISO installs, yes. Some minimal cloud images omit it — install with `sudo apt update && sudo apt install cron` if `crontab -e` reports command not found.",
      },
      {
        q: "How do I check if my cron job actually ran on Ubuntu?",
        a: "Check `grep CRON /var/log/syslog` (or `journalctl -u cron` on newer systemd-based logging) — every cron invocation attempt is logged there, whether it succeeded or failed.",
      },
      {
        q: "Does Ubuntu support @reboot?",
        a: "Yes — @reboot is supported and runs the command once when the cron daemon starts (typically at boot), useful for start-up scripts that don't need a full systemd unit.",
      },
    ],
  },
  {
    slug: "macos-cron",
    title: "macOS Cron Guide — Setup, Permissions & launchd Alternative | CronParser",
    metaDescription:
      "How cron works on macOS, why Apple recommends launchd instead, and the Full Disk Access permission issue that silently breaks many cron jobs.",
    h1: "macOS Cron Guide",
    category: "Operating System",
    intro:
      "macOS ships with a BSD-derived cron for backward compatibility, but Apple has steered developers toward launchd (via launchctl and .plist files) as the native scheduling mechanism since Mac OS X 10.4. Cron still works today, but it runs into macOS-specific permission restrictions that don't exist on Linux.",
    syntaxNotes:
      "Standard 5-field cron syntax, same as Linux. The differences that matter on macOS are entirely about permissions and process management, not the schedule format itself.",
    codeExamples: [
      { label: "Edit your crontab", code: "crontab -e" },
      { label: "launchd alternative: a user LaunchAgent plist", code: "<key>StartCalendarInterval</key>\n<dict>\n  <key>Hour</key><integer>2</integer>\n  <key>Minute</key><integer>0</integer>\n</dict>" },
    ],
    gotchas: [
      "macOS's Transparency, Consent, and Control (TCC) privacy system requires cron itself to be granted Full Disk Access in System Settings before cron jobs can read files in Documents, Desktop, Downloads, or other protected folders — without it, jobs fail silently with permission errors.",
      "cron is not guaranteed to run if the Mac is asleep at the scheduled time, and unlike some launchd configurations, it won't automatically run a missed job on wake.",
      "Apple could remove cron in a future macOS release since it's officially considered legacy — Apple's own documentation has recommended launchd since 2005, so cron on macOS should be treated as a compatibility feature, not a long-term guarantee.",
    ],
    bestPractices: [
      "Grant Full Disk Access to /usr/sbin/cron (System Settings → Privacy & Security → Full Disk Access) immediately if your cron jobs touch anything outside /tmp or your home directory's non-protected paths.",
      "For anything you plan to rely on long-term, prefer launchd LaunchAgents (per-user) or LaunchDaemons (system-wide) — they integrate properly with macOS's power management and don't hit the same permission walls.",
      "Test cron jobs manually first (run the exact command cron would run, in a clean shell) since GUI-launched Terminal sessions have a different environment than cron's.",
    ],
    faqs: [
      {
        q: "Why does my macOS cron job fail even though the syntax is correct?",
        a: "The most common cause is TCC/Full Disk Access — macOS silently blocks cron from reading certain user folders unless it's been explicitly granted permission in System Settings, and the failure often produces no obvious error in your script's own logging.",
      },
      {
        q: "Should I use cron or launchd on macOS?",
        a: "For anything long-term or system-critical, launchd is Apple's recommended and actively maintained mechanism. Cron remains fine for quick personal scripts, but be aware it's a legacy compatibility layer, not a first-class citizen on macOS.",
      },
      {
        q: "Does crontab -e work the same as on Linux?",
        a: "Yes, the command and editing experience are identical (both use vi by default on macOS unless EDITOR is set) — it's the runtime permission environment that differs, not the crontab syntax or editing workflow.",
      },
    ],
  },
  {
    slug: "windows-task-scheduler-vs-cron",
    title: "Windows Task Scheduler vs Cron — Key Differences | CronParser",
    metaDescription:
      "Compare Windows Task Scheduler and Unix cron: syntax, GUI vs config file, trigger types, and how to translate a cron expression into a scheduled task.",
    h1: "Windows Task Scheduler vs Cron",
    category: "Operating System",
    intro:
      "Windows has no built-in cron daemon — its native equivalent is Task Scheduler, a GUI-first (with a command-line and PowerShell API) tool with a fundamentally different configuration model: structured triggers and actions instead of a plain-text schedule string. Anyone moving a script between Linux and Windows needs to translate cron's compact syntax into Task Scheduler's trigger model.",
    syntaxNotes:
      "Task Scheduler has no cron-string equivalent natively — schedules are defined as XML-backed \"triggers\" (Daily, Weekly, Monthly, On a schedule, At log on, At startup, etc.), each with its own set of fields, rather than one universal 5-field expression.",
    codeExamples: [
      { label: "Create a daily task via schtasks (CLI)", code: "schtasks /create /tn \"DailyBackup\" /tr \"C:\\scripts\\backup.bat\" /sc daily /st 02:00" },
      { label: "Equivalent cron expression", code: "0 2 * * *" },
      { label: "PowerShell: register a scheduled task", code: "$trigger = New-ScheduledTaskTrigger -Daily -At 2am\nRegister-ScheduledTask -TaskName \"DailyBackup\" -Trigger $trigger -Action (New-ScheduledTaskAction -Execute \"C:\\scripts\\backup.bat\")" },
    ],
    gotchas: [
      "Task Scheduler triggers don't map 1:1 onto every cron pattern — something like \"every 15 minutes, weekdays only, 9 AM to 5 PM\" (*/15 9-17 * * 1-5) requires a repeating trigger with a duration and a separate day-of-week condition, configured through multiple UI panels or several PowerShell/XML properties.",
      "By default, scheduled tasks only run when a specific user is logged on unless you explicitly configure 'Run whether user is logged on or not,' which also requires storing credentials — a common surprise for anyone assuming cron-like always-on behavior.",
      "Task history and triggers are stored in the Task Scheduler Library, not a single text file, making bulk review or version-controlling your schedule far more cumbersome than grepping a crontab file.",
    ],
    bestPractices: [
      "Use `schtasks /create` or a PowerShell script for anything you want to reproduce reliably — treat the GUI as fine for one-off manual tasks but not for anything you need to check into source control.",
      "For genuinely cron-like scheduling on Windows (especially if you're porting Linux automation), consider running actual cron under WSL (Windows Subsystem for Linux) rather than translating every expression into Task Scheduler's trigger model.",
      "Always set 'Run with highest privileges' and the correct user account explicitly — silent permission failures are as common on Windows as PATH issues are on Linux cron.",
    ],
    faqs: [
      {
        q: "Can I use cron syntax directly on Windows?",
        a: "Not with native Task Scheduler — it doesn't understand cron strings. You'd either translate manually, use a third-party tool that wraps Task Scheduler with cron syntax, or run actual cron inside WSL.",
      },
      {
        q: "Is there a cron daemon for Windows?",
        a: "Not built-in, but WSL (Windows Subsystem for Linux) lets you run a real Linux cron daemon on Windows 10/11, which is often the simplest path if you specifically need cron syntax rather than Task Scheduler's model.",
      },
      {
        q: "How do I express 'every 5 minutes' in Task Scheduler?",
        a: "Create a trigger set to repeat, with a repetition interval of 5 minutes and a duration (e.g., 1 day or indefinitely) — there's no direct equivalent to cron's compact */5 syntax in the UI, though the underlying XML task definition can express it precisely.",
      },
    ],
  },
  {
    slug: "kubernetes-cronjob",
    title: "Kubernetes CronJob Guide — YAML Syntax & Examples | CronParser",
    metaDescription:
      "How to schedule recurring jobs in Kubernetes with CronJob resources: YAML manifest syntax, concurrency policy, and common gotchas.",
    h1: "Kubernetes CronJob Guide",
    category: "Container & Orchestration",
    intro:
      "Kubernetes' CronJob resource creates a new Job (and therefore a new Pod) on a schedule, using the exact same standard 5-field cron syntax as Linux — but wrapped in a YAML manifest with its own concurrency, history, and deadline controls that a plain crontab doesn't have to think about.",
    syntaxNotes:
      "The `schedule` field accepts standard 5-field cron syntax (no seconds field, no @nicknames in older versions — check your cluster's Kubernetes version). Everything else (concurrencyPolicy, successfulJobsHistoryLimit, startingDeadlineSeconds) is Kubernetes-specific YAML, not part of cron itself.",
    codeExamples: [
      {
        label: "Basic CronJob manifest",
        code: "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: nightly-backup\nspec:\n  schedule: \"0 2 * * *\"\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n            - name: backup\n              image: my-backup-image:latest\n          restartPolicy: OnFailure",
      },
      {
        label: "Preventing overlapping runs",
        code: "spec:\n  schedule: \"*/5 * * * *\"\n  concurrencyPolicy: Forbid\n  startingDeadlineSeconds: 60",
      },
    ],
    gotchas: [
      "CronJobs schedule in the Kubernetes controller manager's timezone — historically UTC by default in most managed clusters, though newer Kubernetes versions (1.24+) support a `timeZone` field directly on the CronJob spec.",
      "By default, `concurrencyPolicy: Allow` lets overlapping Job runs stack up if a previous run is still going — for anything non-idempotent, set it to `Forbid` (skip a run if the previous is still active) or `Replace` (kill the old one and start fresh).",
      "A CronJob that's suspended, or whose controller was down at the scheduled time, can miss a run entirely if it falls outside `startingDeadlineSeconds` — Kubernetes doesn't guarantee catch-up execution the way anacron does on Linux.",
    ],
    bestPractices: [
      "Always set `concurrencyPolicy` explicitly rather than relying on the `Allow` default, especially for jobs that write to shared state.",
      "Set `successfulJobsHistoryLimit` and `failedJobsHistoryLimit` to reasonable small numbers (e.g. 3 and 1) — Kubernetes keeps completed Job objects around by default, and they accumulate indefinitely otherwise.",
      "Use `kubectl create job --from=cronjob/<name> manual-run` to trigger an ad-hoc run for testing without waiting for the schedule or editing the CronJob itself.",
    ],
    faqs: [
      {
        q: "Does Kubernetes CronJob support 6-field (with seconds) cron syntax?",
        a: "No — the schedule field uses standard 5-field cron with no seconds field, same as Linux. The minimum granularity is one minute.",
      },
      {
        q: "What timezone does a CronJob run in?",
        a: "By default, the kube-controller-manager's timezone (commonly UTC on managed clusters). Kubernetes 1.24+ supports an explicit `timeZone` field on the CronJob spec (using IANA timezone names) to avoid this ambiguity.",
      },
      {
        q: "How do I debug a CronJob that never runs?",
        a: "Check `kubectl get cronjob` for the schedule and suspend status, `kubectl get jobs` to see if Jobs were even created, and `kubectl describe cronjob <name>` for events — a common cause is the controller being unable to create Jobs due to resource quotas or RBAC permissions.",
      },
    ],
  },
  {
    slug: "github-actions-cron",
    title: "GitHub Actions Cron Guide — Scheduled Workflows | CronParser",
    metaDescription:
      "Schedule GitHub Actions workflows with cron syntax: the schedule trigger, UTC-only timing, and why scheduled workflows can be delayed.",
    h1: "GitHub Actions Cron Guide",
    category: "CI/CD",
    intro:
      "GitHub Actions lets you trigger a workflow on a schedule using the `schedule` event with standard 5-field cron syntax in your workflow YAML. It's one of the most common ways teams run nightly builds, dependency checks, and periodic maintenance jobs without any external infrastructure.",
    syntaxNotes:
      "Standard 5-field POSIX cron syntax inside the workflow's `on.schedule.cron` key, always evaluated in UTC — there's no way to specify a different timezone for a schedule trigger.",
    codeExamples: [
      {
        label: "Nightly workflow at 2 AM UTC",
        code: "on:\n  schedule:\n    - cron: \"0 2 * * *\"\n\njobs:\n  nightly-build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: ./build.sh",
      },
      {
        label: "Multiple schedules in one workflow",
        code: "on:\n  schedule:\n    - cron: \"0 6 * * 1-5\"   # weekday mornings\n    - cron: \"0 18 * * 1-5\"  # weekday evenings",
      },
    ],
    gotchas: [
      "GitHub explicitly does not guarantee schedules run at the exact minute — during periods of high load on GitHub's infrastructure, scheduled workflows can be delayed or, rarely, dropped entirely. Don't use scheduled workflows for anything with a hard timing SLA.",
      "Scheduled workflows only run on the default branch, and only if the repository has had activity within the last 60 days — GitHub automatically disables schedule triggers on completely inactive repos.",
      "The schedule is always UTC with no exceptions — a common mistake is writing a schedule assuming it'll run in the repo owner's local timezone, which silently produces the wrong local time year-round or seasonally around DST.",
    ],
    bestPractices: [
      "Add a manual `workflow_dispatch` trigger alongside `schedule` so you can test and manually re-run the workflow without waiting for (or faking) the schedule.",
      "Compute your desired local time in UTC explicitly and leave a comment in the YAML noting the intended local time — future editors won't have to re-derive the UTC offset.",
      "For anything genuinely time-critical, don't rely solely on GitHub Actions' scheduler — pair it with an external monitor that alerts if the expected run didn't happen within a reasonable window.",
    ],
    faqs: [
      {
        q: "Can I run a GitHub Actions schedule more often than every 5 minutes?",
        a: "GitHub's documented minimum interval is 5 minutes, and even schedules at that frequency are explicitly best-effort — high-frequency schedules are more likely to experience delays.",
      },
      {
        q: "Why didn't my scheduled workflow run?",
        a: "Check whether the repository has had any commits in the last 60 days (schedules auto-disable on stale repos), whether the workflow file is on the default branch, and the Actions tab's schedule history for delay or skip indicators.",
      },
      {
        q: "Can I set a schedule to a specific timezone?",
        a: "No — the cron field is always evaluated in UTC. Convert your desired local time to UTC when writing the expression (the Cron Timezone Converter tool can help with this).",
      },
    ],
  },
  {
    slug: "aws-eventbridge-scheduler",
    title: "AWS EventBridge Scheduler Cron Guide | CronParser",
    metaDescription:
      "How cron and rate expressions work in AWS EventBridge Scheduler: 6-field Quartz-style syntax, UTC timing, and common Lambda trigger patterns.",
    h1: "AWS EventBridge Scheduler Cron Guide",
    category: "Cloud Scheduler",
    intro:
      "AWS EventBridge Scheduler (and its predecessor, EventBridge/CloudWatch Events rules) supports two expression types: rate expressions (rate(5 minutes)) for simple fixed intervals, and cron expressions for anything calendar-based — but AWS's cron syntax is Quartz-derived, not standard POSIX cron, which trips up anyone copying an expression straight from a Linux crontab.",
    syntaxNotes:
      "AWS cron expressions have 6 required fields: minutes, hours, day-of-month, month, day-of-week, year — and critically, exactly one of day-of-month or day-of-week must be a question mark (?), never both wildcards, unlike standard cron's OR semantics.",
    codeExamples: [
      { label: "Every day at 8 AM UTC (AWS cron)", code: "cron(0 8 * * ? *)" },
      { label: "Every 10 minutes (rate expression)", code: "rate(10 minutes)" },
      { label: "First Monday of every month at 9 AM UTC", code: "cron(0 9 ? * 2#1 *)" },
    ],
    gotchas: [
      "Standard cron's `0 8 * * *` is invalid in AWS EventBridge — you must use `?` in either the day-of-month or day-of-week field, since AWS forbids both being wildcards simultaneously (unlike standard cron's OR-based resolution).",
      "AWS cron expressions always run in UTC — there's no per-rule timezone setting in the older CloudWatch Events cron rules (EventBridge Scheduler, the newer service, does support a `ScheduleExpressionTimezone` field, so check which service you're actually using).",
      "The 6-field format includes a year field that standard cron doesn't have — omitting it or getting the field order wrong is a frequent copy-paste error when porting expressions from a Linux crontab.",
    ],
    bestPractices: [
      "Use rate() expressions instead of cron() whenever you just need a fixed interval (\"every N minutes/hours/days\") — they're simpler and less error-prone than the equivalent cron syntax.",
      "If using the newer EventBridge Scheduler (not legacy CloudWatch Events rules), set `ScheduleExpressionTimezone` explicitly rather than mentally converting to UTC — it removes an entire class of DST-related bugs.",
      "Always test a new schedule expression with AWS's schedule expression validator in the console before deploying, since a malformed 6-field expression fails at rule-creation time, not at runtime.",
    ],
    faqs: [
      {
        q: "Why does AWS reject my standard cron expression?",
        a: "AWS uses a Quartz-derived 6-field format that requires a year field and a `?` in either day-of-month or day-of-week — standard 5-field POSIX cron expressions aren't valid as-is and need to be adapted.",
      },
      {
        q: "What's the difference between rate() and cron() in EventBridge?",
        a: "rate() expresses a simple fixed interval like rate(5 minutes) or rate(1 day). cron() expresses calendar-based schedules (specific times, specific days) using the 6-field AWS cron format — use whichever matches your actual requirement.",
      },
      {
        q: "Does EventBridge Scheduler support timezones other than UTC?",
        a: "The newer EventBridge Scheduler service supports a ScheduleExpressionTimezone parameter using IANA timezone names. The older CloudWatch Events (EventBridge rules) cron syntax is UTC-only.",
      },
    ],
  },
  {
    slug: "google-cloud-scheduler",
    title: "Google Cloud Scheduler Cron Guide | CronParser",
    metaDescription:
      "How to schedule jobs with Google Cloud Scheduler: standard 5-field cron syntax (unix-cron), timezone support, and HTTP/Pub/Sub targets.",
    h1: "Google Cloud Scheduler Guide",
    category: "Cloud Scheduler",
    intro:
      "Google Cloud Scheduler is GCP's fully managed cron job service, notable for using standard 5-field \"unix-cron\" syntax directly — unlike AWS's Quartz-derived format — while adding first-class IANA timezone support and the ability to trigger HTTP endpoints, Pub/Sub topics, or App Engine services.",
    syntaxNotes:
      "Standard 5-field unix-cron syntax, identical to Linux cron, with a required, explicit IANA timezone (e.g. America/New_York) set per job rather than assuming UTC.",
    codeExamples: [
      {
        label: "Create a scheduled HTTP job (gcloud CLI)",
        code: "gcloud scheduler jobs create http nightly-report \\\n  --schedule=\"0 2 * * *\" \\\n  --uri=\"https://example.com/run-report\" \\\n  --time-zone=\"America/New_York\"",
      },
      { label: "Every 15 minutes, business hours, weekdays", code: "*/15 9-17 * * 1-5" },
    ],
    gotchas: [
      "Cloud Scheduler jobs require a target (HTTP endpoint, Pub/Sub topic, or App Engine service) at creation time — unlike a crontab entry, you can't create a bare schedule without wiring it to something concrete first.",
      "Failed HTTP targets are retried according to a configurable retry policy, which can cause a job to appear to run more often than its schedule suggests if the endpoint is flaky — check the retry configuration, not just the cron expression, when a job seems to over-fire.",
      "The legacy App Engine cron.yaml mechanism (a separate, older feature) uses its own schedule syntax (\"every 24 hours\", \"every monday 09:00\") that is not standard cron — don't confuse it with Cloud Scheduler's unix-cron format.",
    ],
    bestPractices: [
      "Always set --time-zone explicitly rather than relying on a default, since Cloud Scheduler's default project timezone may not match what you expect.",
      "Use Pub/Sub as the target when the downstream work is asynchronous or needs reliable delivery — it decouples the schedule from a single HTTP endpoint's availability.",
      "Set a reasonable max retry count and backoff for HTTP targets — the default retry behavior can mask a genuinely broken endpoint as an intermittent scheduling issue.",
    ],
    faqs: [
      {
        q: "Does Cloud Scheduler use the same cron syntax as Linux?",
        a: "Yes — Google explicitly implements standard 5-field unix-cron syntax, making it one of the more portable cloud schedulers if you're migrating expressions directly from a Linux crontab.",
      },
      {
        q: "Can I set a timezone for a Cloud Scheduler job?",
        a: "Yes, and it's effectively required — every job has an explicit IANA timezone field, so there's no UTC-only ambiguity like some other cloud schedulers.",
      },
      {
        q: "What's the difference between Cloud Scheduler and the old App Engine cron.yaml?",
        a: "cron.yaml is a legacy App Engine-specific mechanism with its own English-like schedule syntax, tied to a single App Engine app. Cloud Scheduler is the modern, standalone service using real unix-cron syntax and can target any HTTP endpoint or Pub/Sub topic, not just App Engine.",
      },
    ],
  },
  {
    slug: "azure-timer-trigger",
    title: "Azure Functions Timer Trigger Cron Guide (NCRONTAB) | CronParser",
    metaDescription:
      "How Azure Functions timer triggers use NCRONTAB syntax: the 6-field seconds-first format, UTC defaults, and common configuration examples.",
    h1: "Azure Functions Timer Trigger Guide",
    category: "Cloud Scheduler",
    intro:
      "Azure Functions' Timer Trigger uses NCRONTAB expressions — a 6-field format that adds a leading seconds field to standard cron, giving Azure sub-minute scheduling precision that plain 5-field cron can't express, at the cost of needing an extra field on every expression.",
    syntaxNotes:
      "6 fields: {second} {minute} {hour} {day} {month} {day-of-week} — note the field order starts with seconds, unlike Quartz's similar-looking but differently-ordered 6/7-field format. Runs in UTC by default unless the WEBSITE_TIME_ZONE app setting is configured.",
    codeExamples: [
      { label: "Every 5 minutes (function.json / attribute)", code: "0 */5 * * * *" },
      { label: "Every day at 2:30 AM UTC", code: "0 30 2 * * *" },
      { label: "C# isolated worker timer trigger", code: "[Function(\"NightlyJob\")]\npublic void Run([TimerTrigger(\"0 0 2 * * *\")] TimerInfo timer) { /* ... */ }" },
    ],
    gotchas: [
      "NCRONTAB's 6 fields start with seconds, while Quartz's 6-field format (used by AWS EventBridge and others) starts with minutes and ends with an optional year — copying an expression between the two without noticing the different field order produces a schedule that silently means something else.",
      "Timer triggers run in UTC by default; setting the WEBSITE_TIME_ZONE app setting changes the timezone, but that setting affects the entire Function App, not just one function, which can have unintended side effects on other time-sensitive code.",
      "On a Consumption plan, a Function App that's scaled to zero can experience a cold start that delays the actual invocation slightly past the scheduled second — for precision-sensitive jobs, an App Service or Premium plan keeps the app warm.",
    ],
    bestPractices: [
      "Double-check field order against NCRONTAB's documentation specifically — its resemblance to both standard cron and Quartz cron makes it easy to misplace a field.",
      "Use a Premium or App Service plan rather than Consumption if scheduled timing precision matters, to avoid cold-start delay on the triggering invocation.",
      "Log the actual UTC invocation time inside the function itself during development, to confirm the schedule fires when you expect before relying on it in production.",
    ],
    faqs: [
      {
        q: "Does NCRONTAB support timezones?",
        a: "Not per-expression — timezone is controlled by the WEBSITE_TIME_ZONE application setting on the whole Function App, not the timer trigger expression itself.",
      },
      {
        q: "How is NCRONTAB different from standard cron?",
        a: "NCRONTAB adds a leading seconds field (6 fields total: second, minute, hour, day, month, day-of-week), giving sub-minute precision that standard 5-field cron cannot express.",
      },
      {
        q: "Can I trigger a timer function manually for testing?",
        a: "Yes — in the Azure Portal or via the Azure Functions Core Tools you can manually invoke a timer-triggered function without waiting for its schedule, which is the standard way to test the function logic itself independent of timing.",
      },
    ],
  },
  {
    slug: "quartz-scheduler",
    title: "Quartz Scheduler Cron Guide — Java Job Scheduling | CronParser",
    metaDescription:
      "Quartz Scheduler's 6/7-field cron syntax for Java applications: the L, W, and # special characters, and how it differs from standard cron.",
    h1: "Quartz Scheduler Cron Guide",
    category: "Application Framework",
    intro:
      "Quartz is the most widely used job scheduling library in the Java ecosystem, and its CronExpression class defines a cron dialect that's become influential enough that AWS EventBridge and Spring both adopted variations of it. Quartz cron is more expressive than standard cron, at the cost of a stricter, less forgiving syntax.",
    syntaxNotes:
      "6 required fields plus an optional 7th: seconds, minutes, hours, day-of-month, month, day-of-week, year (optional). Exactly one of day-of-month/day-of-week must be ? — both can't be * simultaneously, the same constraint AWS EventBridge inherited from Quartz.",
    codeExamples: [
      { label: "Every day at 8:30:00 AM", code: "0 30 8 * * ?" },
      { label: "Last day of every month at midnight", code: "0 0 0 L * ?" },
      { label: "First Friday of every month at noon", code: "0 0 12 ? * 6#1" },
      { label: "Java: scheduling with CronScheduleBuilder", code: "CronTrigger trigger = TriggerBuilder.newTrigger()\n  .withSchedule(CronScheduleBuilder.cronSchedule(\"0 0 2 * * ?\"))\n  .build();" },
    ],
    gotchas: [
      "Quartz throws a ParseException at trigger-creation time (not silently) if both day-of-month and day-of-week are *  — you must set one of them to ? — this is a frequent first-time error for anyone used to standard cron's OR semantics.",
      "The L (last) and W (nearest weekday) characters can be combined (LW means \"last weekday of the month\") but have specific restrictions — L can't be used with a list or range of values in the same field, which throws a runtime error if attempted.",
      "The # character (nth weekday, e.g. 6#3 for the third Friday) only accepts values 1–5, and there's no way to express \"last occurrence of weekday X\" other than combining it with L in the day-of-month field in specific ways — the syntax here is genuinely more complex than the L/W characters alone suggest.",
    ],
    bestPractices: [
      "Always set day-of-month or day-of-week to ? (never both to *), and treat that as a required first check whenever a Quartz expression fails to parse.",
      "Use Quartz's own CronExpression.isValidExpression() (or an equivalent validator) at application startup or in tests, rather than discovering a malformed expression when the trigger fires the first time in production.",
      "Keep a comment next to any expression using L, W, or # explaining the intended date in plain English — these characters are powerful but not immediately readable at a glance.",
    ],
    faqs: [
      {
        q: "What does the ? character mean in Quartz cron?",
        a: "It means \"no specific value\" and is required in either the day-of-month or day-of-week field whenever the other field has a specific value — it exists specifically to avoid the ambiguous OR-logic that standard cron uses when both fields are restricted.",
      },
      {
        q: "Can I use Quartz cron syntax in a Linux crontab?",
        a: "No — the seventh (year) field, the ? character, and L/W/# are all Quartz-specific extensions that standard Vixie/POSIX cron doesn't understand. Quartz expressions need to be translated to standard syntax (dropping unsupported characters) to run on Linux cron.",
      },
      {
        q: "Is the year field required?",
        a: "No, it's optional — if omitted, Quartz treats the year as unrestricted (matches any year), which is the correct default for the overwhelming majority of recurring schedules.",
      },
    ],
  },
  {
    slug: "jenkins-cron",
    title: "Jenkins Cron Guide — Build Trigger Syntax | CronParser",
    metaDescription:
      "How to schedule Jenkins builds with cron syntax: the Build periodically trigger, the H (hash) character for load distribution, and common patterns.",
    h1: "Jenkins Cron Guide",
    category: "CI/CD",
    intro:
      "Jenkins' \"Build periodically\" and \"Poll SCM\" triggers use a cron-like syntax that's mostly standard 5-field cron, plus one genuinely useful Jenkins-specific addition: the H (hash) symbol, which spreads job start times across a range instead of having every job fire at exactly the same instant.",
    syntaxNotes:
      "Standard 5-field structure, but any field can use H instead of a fixed number or *. Jenkins computes a stable hash (based on the job name) to pick a pseudo-random, consistent value within the field's range — the same job always gets the same offset, but different jobs get spread out.",
    codeExamples: [
      { label: "Every hour, at a consistent-but-spread minute", code: "H * * * *" },
      { label: "Once a day, sometime between midnight and 1 AM", code: "H H(0-1) * * *" },
      { label: "Every 15 minutes (Jenkins style)", code: "H/15 * * * *" },
    ],
    gotchas: [
      "Using a literal `*` in the minute field for many jobs (e.g. \"every hour on the hour\" for dozens of jobs) causes them all to fire at exactly :00 simultaneously, potentially overloading the Jenkins controller — H exists specifically to prevent this and should be the default choice, not *.",
      "H's computed offset is deterministic per job name, so it looks 'random' but is actually stable across restarts — renaming a job changes its hash and therefore its effective schedule slightly, which can be surprising if you're tracking exact run times.",
      "Poll SCM and Build periodically are separate triggers with separate cron fields — a common mistake is configuring one and expecting it to also control the other.",
    ],
    bestPractices: [
      "Default to H instead of a fixed number or * for the minute (and often hour) field on any recurring build — it costs nothing and prevents thundering-herd load spikes on shared Jenkins infrastructure.",
      "Use H(0-1) style range-restricted hashes when you need a build to happen within a general window (e.g. 'sometime overnight') without needing it pinned to an exact minute.",
      "For pipeline-as-code (Jenkinsfile), define the cron trigger in the `triggers { cron('H H * * *') }` block so the schedule is version-controlled alongside the pipeline itself, rather than configured only through the UI.",
    ],
    faqs: [
      {
        q: "What does H mean in a Jenkins cron expression?",
        a: "H (hash) tells Jenkins to pick a pseudo-random but stable value within that field's valid range, computed from the job's name. It's used to spread out job start times and avoid many jobs firing at the exact same second.",
      },
      {
        q: "Is Jenkins cron syntax compatible with standard cron?",
        a: "Mostly — a standard 5-field cron expression without H works identically. The H character itself is a Jenkins-specific extension not understood by standard Linux cron.",
      },
      {
        q: "How do I make a Jenkins job run every 15 minutes without clustering?",
        a: "Use H/15 * * * * instead of */15 * * * * — the hash offset means your job's 15-minute cycle starts at a job-specific minute rather than always on the exact quarter-hour alongside every other job using */15.",
      },
    ],
  },
  {
    slug: "node-cron",
    title: "node-cron Guide — Scheduling Jobs in Node.js | CronParser",
    metaDescription:
      "How to schedule recurring tasks in Node.js with the node-cron package: standard cron syntax, timezone options, and common patterns.",
    h1: "node-cron Guide",
    category: "Application Framework",
    intro:
      "node-cron is the most widely used npm package for in-process job scheduling in Node.js applications — it parses standard cron syntax and runs your callback function on schedule, entirely inside your existing Node process, without needing the OS's own cron daemon.",
    syntaxNotes:
      "Supports standard 5-field cron syntax, plus an optional 6th leading seconds field if you need sub-minute precision. Runs entirely in-process — the schedule only exists while your Node application is running.",
    codeExamples: [
      {
        label: "Basic scheduled task",
        code: "const cron = require('node-cron');\n\ncron.schedule('*/5 * * * *', () => {\n  console.log('Running every 5 minutes');\n});",
      },
      {
        label: "With an explicit timezone",
        code: "cron.schedule('0 9 * * 1-5', () => {\n  sendDailyReport();\n}, {\n  timezone: 'America/New_York',\n});",
      },
    ],
    gotchas: [
      "Because node-cron runs in-process, the schedule stops entirely if the Node process crashes or restarts — unlike system cron, there's no separate daemon keeping the schedule alive independent of your application's uptime.",
      "Running multiple instances of your app (common in horizontally-scaled deployments) means the scheduled task fires once per instance, not once total — without external coordination (a lock, a dedicated scheduler instance, or a distributed lock), the same job can run N times simultaneously.",
      "node-cron validates the cron string at `schedule()` call time and throws synchronously if it's invalid — an unhandled exception here can crash the whole process at startup if the validation isn't wrapped defensively.",
    ],
    bestPractices: [
      "In any horizontally-scaled deployment, either run scheduled jobs from a single dedicated instance/process, or use a distributed lock (Redis-based, for example) so only one instance actually executes the task per scheduled time.",
      "Wrap the scheduled callback's body in a try/catch — an uncaught exception inside the callback can otherwise crash the whole process depending on your error-handling setup, taking down more than just the scheduled task.",
      "Set the `timezone` option explicitly rather than relying on the server's local timezone, especially for anything deployed across multiple regions.",
    ],
    faqs: [
      {
        q: "Does node-cron persist schedules across restarts?",
        a: "No — the schedule only exists in memory while the Node process is running. If the process restarts, `cron.schedule()` needs to be called again (typically at application startup) to re-register the job.",
      },
      {
        q: "Can node-cron run tasks more precisely than once a minute?",
        a: "Yes, via the optional 6-field syntax with a leading seconds field, giving second-level granularity if your Node event loop can keep up with it.",
      },
      {
        q: "What happens if two instances of my app both run the same node-cron schedule?",
        a: "Both will fire independently at the scheduled time, effectively running the job twice (or N times for N instances) — node-cron has no built-in cross-instance coordination, so you need external locking for anything that shouldn't run more than once.",
      },
    ],
  },
  {
    slug: "laravel-scheduler",
    title: "Laravel Task Scheduler Guide — Fluent Syntax & Cron | CronParser",
    metaDescription:
      "How Laravel's task scheduler works: the fluent API (->daily(), ->hourly()), the single cron entry needed, and common scheduling patterns.",
    h1: "Laravel Task Scheduler Guide",
    category: "Application Framework",
    intro:
      "Laravel's scheduler lets you define all of an application's recurring tasks in PHP code (routes/console.php or the Console\\Kernel class, depending on Laravel version) using a fluent, readable API — instead of managing a dozen separate crontab entries, your server's actual crontab needs exactly one line pointing at Laravel's own scheduler.",
    syntaxNotes:
      "Under the hood, Laravel's fluent methods (->daily(), ->hourly(), ->weeklyOn()) compile down to standard cron expressions, but you can also call ->cron('* * * * *') directly with a raw expression if the fluent API doesn't cover your exact case.",
    codeExamples: [
      { label: "The one crontab entry Laravel needs", code: "* * * * * cd /path/to/artisan && php artisan schedule:run >> /dev/null 2>&1" },
      {
        label: "Defining scheduled tasks (fluent API)",
        code: "Schedule::command('emails:send')->dailyAt('09:00');\nSchedule::call(fn () => Cache::flush())->hourly();\nSchedule::command('report:weekly')->weeklyOn(1, '08:00');",
      },
      { label: "Raw cron expression when the fluent API isn't enough", code: "Schedule::command('inventory:sync')->cron('*/15 9-17 * * 1-5');" },
    ],
    gotchas: [
      "Laravel's scheduler only actually checks and runs due tasks when `schedule:run` is invoked — this requires exactly one crontab entry running every minute; forgetting that single entry means none of the fluent schedule definitions in your code will ever fire.",
      "By default, overlapping runs are allowed if a task takes longer than its interval — use `->withoutOverlapping()` explicitly for any task that shouldn't have two instances running concurrently.",
      "Scheduled tasks run in the timezone configured in config/app.php ('timezone') by default, not necessarily the server's OS timezone — mismatches between the two are a common source of \"my task ran at the wrong time\" confusion.",
    ],
    bestPractices: [
      "Add `->withoutOverlapping()` to any task where a slow run could overlap the next scheduled invocation, and `->onOneServer()` if you're running the scheduler on multiple load-balanced servers.",
      "Use `->emailOutputOnFailure()` or send failures to your logging/monitoring stack — Laravel's scheduler runs silently by default, so failures can go unnoticed without explicit output handling.",
      "Run `php artisan schedule:list` to see every registered scheduled task and its next run time — invaluable for verifying what's actually configured versus what you assume is configured.",
    ],
    faqs: [
      {
        q: "Do I need a crontab entry for every scheduled task in Laravel?",
        a: "No — exactly one crontab entry (running php artisan schedule:run every minute) is needed regardless of how many tasks you define in code. Laravel's scheduler checks all defined tasks internally and runs whichever are due.",
      },
      {
        q: "Can I use raw cron syntax instead of the fluent methods?",
        a: "Yes — every scheduled task supports ->cron('* * * * *') with a standard cron expression directly, for cases the fluent API (->daily(), ->hourly(), etc.) doesn't conveniently express.",
      },
      {
        q: "How do I test a scheduled task without waiting for its actual time?",
        a: "Run `php artisan schedule:run` manually (it executes any task that's currently due), or call the underlying Artisan command/closure directly to test its logic independent of scheduling.",
      },
    ],
  },
  {
    slug: "spring-scheduler",
    title: "Spring @Scheduled Cron Guide — Java Scheduling | CronParser",
    metaDescription:
      "How Spring's @Scheduled annotation uses cron expressions: 6-field Quartz-inspired syntax, fixedRate vs cron, and common configuration patterns.",
    h1: "Spring @Scheduled Cron Guide",
    category: "Application Framework",
    intro:
      "Spring Framework's @Scheduled annotation is the standard way to run recurring tasks in a Spring Boot application, supporting both simple fixed-interval scheduling (fixedRate, fixedDelay) and full cron expressions for calendar-based schedules — all running in-process via Spring's TaskScheduler.",
    syntaxNotes:
      "Spring's cron field uses 6 fields: second, minute, hour, day-of-month, month, day-of-week — inspired by Quartz but implemented independently (Spring's own CronExpression class), so not every Quartz-specific character behaves identically.",
    codeExamples: [
      { label: "Cron-based schedule (every day at 2:30:00 AM)", code: "@Scheduled(cron = \"0 30 2 * * *\")\npublic void nightlyJob() { /* ... */ }" },
      { label: "Fixed-rate alternative (every 5 minutes)", code: "@Scheduled(fixedRate = 300000)\npublic void pollEvery5Minutes() { /* ... */ }" },
      { label: "With an explicit timezone", code: "@Scheduled(cron = \"0 0 9 * * MON-FRI\", zone = \"America/New_York\")\npublic void weekdayMorningJob() { /* ... */ }" },
    ],
    gotchas: [
      "Spring's cron field order (second first) is the same shape as Quartz's, but Spring implements its own parser — some Quartz-specific characters and edge-case behaviors (particularly around L and W) aren't guaranteed to behave identically, so don't assume full drop-in compatibility.",
      "By default, @Scheduled methods run on a single shared thread unless you configure a TaskScheduler with a larger thread pool — a slow scheduled method can delay other scheduled tasks in the same application if they share the default scheduler.",
      "@Scheduled only works on Spring-managed beans (a @Component, @Service, etc.) — annotating a plain unmanaged class's method silently does nothing, with no warning at startup.",
    ],
    bestPractices: [
      "Configure a dedicated TaskScheduler bean with an appropriately sized thread pool if you have more than a couple of @Scheduled methods, to avoid one slow task blocking others.",
      "Set the `zone` attribute explicitly for anything timezone-sensitive rather than relying on the JVM's default timezone, which can vary between local development and production environments.",
      "Use Spring Boot Actuator's /actuator/scheduledtasks endpoint (if enabled) to inspect exactly which scheduled tasks are registered and their cron expressions at runtime — useful for verifying configuration in a running application.",
    ],
    faqs: [
      {
        q: "What's the difference between cron, fixedRate, and fixedDelay?",
        a: "cron takes a calendar-based expression for specific times/days. fixedRate runs every N milliseconds regardless of how long the previous execution took (can overlap). fixedDelay waits N milliseconds after the previous execution finishes before starting the next one.",
      },
      {
        q: "Is Spring's cron syntax identical to Quartz?",
        a: "Similar in shape (6 fields, second-first) but implemented independently — Spring has its own CronExpression parser, and while common patterns work identically, edge cases around special characters aren't guaranteed to match Quartz exactly.",
      },
      {
        q: "Why isn't my @Scheduled method running?",
        a: "The most common cause is the class not being a Spring-managed bean, or @EnableScheduling missing from a configuration class — both fail silently with no startup error, so check those first before suspecting the cron expression itself.",
      },
    ],
  },
  {
    slug: "docker-cron",
    title: "Cron in Docker Guide — Running Scheduled Jobs in Containers | CronParser",
    metaDescription:
      "Docker has no built-in cron. See the common patterns for scheduled jobs in containers: cron inside the container, sidecar containers, and orchestrator-native scheduling.",
    h1: "Cron in Docker Guide",
    category: "Container & Orchestration",
    intro:
      "Docker containers are designed to run a single foreground process, and there's no built-in Docker equivalent to cron — \"scheduling a Docker job\" always means choosing one of several patterns: running cron inside the container alongside your app, a dedicated sidecar/cron container, or delegating to your orchestrator's native scheduler (like Kubernetes CronJob).",
    syntaxNotes:
      "There's no Docker-specific cron syntax — whichever approach you choose ends up using either standard Linux cron syntax (if cron runs inside a container) or your orchestrator's own scheduling syntax (e.g. Kubernetes CronJob's standard 5-field YAML schedule field).",
    codeExamples: [
      {
        label: "Running cron inside a container (Dockerfile)",
        code: "FROM debian:bookworm-slim\nRUN apt-get update && apt-get install -y cron\nCOPY crontab /etc/cron.d/app-cron\nRUN chmod 0644 /etc/cron.d/app-cron && crontab /etc/cron.d/app-cron\nCMD [\"cron\", \"-f\"]",
      },
      {
        label: "Dedicated cron sidecar (docker-compose.yml)",
        code: "services:\n  app:\n    image: my-app\n  scheduler:\n    image: my-app\n    entrypoint: crond -f\n    volumes:\n      - ./crontab:/etc/crontabs/root",
      },
    ],
    gotchas: [
      "Running cron as PID 1 in a container (`CMD [\"cron\", \"-f\"]`) means cron itself must handle signal forwarding correctly, or the container won't shut down cleanly on `docker stop` — this trips up a lot of first attempts at containerized cron.",
      "A cron job running inside a container only has access to that container's filesystem and environment — if it needs to interact with another service's container (a database, an app container), it needs proper networking/volume configuration, unlike host cron which has full host access.",
      "If you scale a service to multiple container replicas and each replica also runs its own embedded cron, the scheduled job fires once per replica — the exact same multi-instance duplication problem as node-cron, just at the container level.",
    ],
    bestPractices: [
      "Prefer your orchestrator's native scheduling (Kubernetes CronJob, ECS Scheduled Tasks, etc.) over cron-inside-a-container whenever you're already running on an orchestrator — it avoids the PID 1 signal-handling and multi-replica duplication problems entirely.",
      "If you must run cron inside a container, use a minimal init system (tini, dumb-init) alongside cron so signals are forwarded correctly and zombie processes don't accumulate.",
      "Keep the scheduled job's logic in a separate script invoked by cron, and send its output to stdout/stderr (not a file inside the container) so `docker logs` captures it — otherwise job output disappears when the container is removed.",
    ],
    faqs: [
      {
        q: "Can I just add a cron job to my application's Dockerfile?",
        a: "Yes, technically, but it means running two processes (cron and your app) in one container, which goes against the one-process-per-container convention and complicates signal handling and logging. It works for simple cases but doesn't scale well.",
      },
      {
        q: "What's the best way to run scheduled jobs in a Docker Swarm or Kubernetes setup?",
        a: "Use the orchestrator's native scheduling primitive — Kubernetes CronJob or Swarm's own patterns — rather than cron inside a container. It integrates properly with the platform's scaling, logging, and restart behavior.",
      },
      {
        q: "How do I see the output of a cron job running inside a container?",
        a: "Redirect the cron job's stdout/stderr to the container's own stdout/stderr (e.g. via `> /proc/1/fd/1 2>/proc/1/fd/2` in the crontab entry) so `docker logs` picks it up — cron's default behavior of emailing output doesn't work in a typical minimal container image.",
      },
    ],
  },
  {
    slug: "wordpress-wp-cron",
    title: "WordPress WP-Cron Guide — How Pseudo-Cron Really Works | CronParser",
    metaDescription:
      "WP-Cron isn't real cron — it's triggered by site visits. Learn how WordPress's pseudo-cron system works, why scheduled posts can be late, and how to fix it with real system cron.",
    h1: "WordPress WP-Cron Guide",
    category: "Application Framework",
    intro:
      "WordPress's built-in scheduling system, WP-Cron, is not a real cron daemon at all — it's a pseudo-cron that piggybacks on site traffic. Every page load triggers a check for due scheduled tasks (post publishing, plugin maintenance, update checks), which works fine on busy sites but causes real, well-documented reliability problems on low-traffic ones.",
    syntaxNotes:
      "WP-Cron events are scheduled with wp_schedule_event() using either a Unix timestamp plus a recurrence interval name ('hourly', 'daily', 'twicedaily', or a custom-registered interval) — there's no raw 5-field cron string in the native WordPress API, though plugins sometimes layer cron-like syntax on top.",
    codeExamples: [
      { label: "Schedule a recurring event (PHP)", code: "if (!wp_next_scheduled('my_hourly_event')) {\n    wp_schedule_event(time(), 'hourly', 'my_hourly_event');\n}\nadd_action('my_hourly_event', 'my_function_to_run');" },
      { label: "Disable pseudo-cron in wp-config.php", code: "define('DISABLE_WP_CRON', true);" },
      { label: "Real system cron entry to replace it", code: "*/5 * * * * curl -s https://example.com/wp-cron.php?doing_wp_cron > /dev/null 2>&1" },
    ],
    gotchas: [
      "On a low-traffic site, WP-Cron events simply don't fire until the next visitor loads a page — a scheduled post set for 3 AM might not actually publish until the first visitor arrives hours later, which is one of the most commonly reported WordPress scheduling bugs.",
      "Every page load technically triggers a wp-cron.php check (even if nothing is due), adding a small but real performance overhead to every request — on high-traffic sites this can mean the pseudo-cron check runs far more often than necessary.",
      "WP-Cron's built-in intervals are limited to hourly, twicedaily, and daily by default — anything more granular (like every 15 minutes) requires registering a custom interval via the cron_schedules filter, which many site owners don't realize is necessary.",
    ],
    bestPractices: [
      "For any production site where scheduling reliability matters, set DISABLE_WP_CRON to true and trigger wp-cron.php via a real system cron job every 1-5 minutes instead — this is the standard, widely-recommended fix.",
      "When adding a real system cron entry, use wget or curl with -s (silent) and discard output, and consider WP-CLI's `wp cron event run --due-now` as a cleaner alternative to hitting the HTTP endpoint directly.",
      "Audit scheduled events periodically with WP-CLI (`wp cron event list`) — plugins that fail to clean up their scheduled events after deactivation are a common source of orphaned, silently-accumulating WP-Cron entries.",
    ],
    faqs: [
      {
        q: "Is WP-Cron the same as real Linux cron?",
        a: "No — it's a pseudo-cron system triggered by page visits, not a background daemon. It only checks for due events when someone (or something) loads a page on the site, which is fundamentally different from real cron's time-based daemon.",
      },
      {
        q: "Why did my scheduled WordPress post publish late?",
        a: "Most likely because no one visited the site around the scheduled time — WP-Cron's check only runs on page load, so a post scheduled for 3 AM on a low-traffic site may not actually publish until the next visitor arrives.",
      },
      {
        q: "How do I fix unreliable WP-Cron scheduling?",
        a: "Disable the pseudo-cron (DISABLE_WP_CRON in wp-config.php) and set up a real system cron job (or a server-level scheduled task) to hit wp-cron.php every few minutes instead — this guarantees checks happen on a real schedule regardless of traffic.",
      },
    ],
  },
  {
    slug: "cpanel-cron",
    title: "cPanel Cron Jobs Guide — Setup via the UI & Common Issues | CronParser",
    metaDescription:
      "How to add, edit, and troubleshoot cron jobs in cPanel: the Cron Jobs UI, email notification pitfalls, PHP path issues, and standard intervals.",
    h1: "cPanel Cron Jobs Guide",
    category: "Control Panel",
    intro:
      "cPanel exposes standard Linux cron through a web UI (Advanced > Cron Jobs) for shared and managed hosting accounts that don't have shell access — the same cron daemon and 5-field syntax underneath, but the most common problems are specific to how cPanel wraps it: PHP path ambiguity, email spam, and relative-path failures.",
    syntaxNotes:
      "cPanel's Cron Jobs page offers dropdown presets (Once Per Minute, Once Per Hour, etc.) or a 'Common Settings' selector, but underneath it's still standard 5-field minute/hour/day/month/weekday cron — the five input fields map directly to those fields and accept the same wildcards, ranges, and steps.",
    codeExamples: [
      { label: "Typical PHP script cron command in cPanel", code: "/usr/local/bin/php -q /home/username/public_html/cron.php" },
      { label: "Silence output from a wget-triggered cron job", code: "wget -q -O - https://example.com/cron.php >/dev/null 2>&1" },
      { label: "Run a script every 15 minutes", code: "*/15 * * * * /home/username/scripts/task.sh" },
    ],
    gotchas: [
      "cPanel emails the account's owner every single run by default unless the command's output is redirected or suppressed — a 5-minute job with no redirection can flood an inbox with hundreds of emails a day.",
      "The PHP binary path varies by hosting provider and by the PHP version selected in MultiPHP Manager — a bare `php script.php` command often fails silently because the shell's default PHP CLI doesn't match the site's configured web-facing PHP version. Use the full version-specific path (e.g. /usr/local/bin/php81) or whatever `which php` returns in cPanel's Terminal.",
      "Relative paths fail under cron because cPanel cron jobs execute from the account's home directory, not the script's own directory — always cd into the directory first or use absolute paths for the script and anything it references.",
    ],
    bestPractices: [
      "Always append `>/dev/null 2>&1` (or redirect to a log file) to the end of every cron command to stop cPanel's default per-run email notifications.",
      "Confirm the exact PHP CLI path and version with `which php` or MultiPHP Manager rather than assuming the PATH's `php` matches your site's configured PHP version.",
      "Use the Cron Jobs UI's built-in next-run preview to sanity-check an expression before saving, especially for less common day-of-week or day-of-month combinations.",
    ],
    faqs: [
      {
        q: "Why am I getting an email every time my cPanel cron job runs?",
        a: "cPanel emails the account holder any output — including warnings and notices — from every cron execution by default. Redirect both stdout and stderr (append >/dev/null 2>&1 to the command) to stop the emails, or redirect to a log file if you want to keep the output.",
      },
      {
        q: "Why does my PHP script work when I run it manually but fail under cPanel cron?",
        a: "cPanel cron jobs often invoke a different PHP binary or version than your site's web-facing PHP, and the command runs with the account's home directory as its working directory rather than the script's folder. Use the full path to the correct php binary (from MultiPHP Manager or `which php`) and absolute paths throughout.",
      },
      {
        q: "Does cPanel support the same cron syntax as regular Linux cron?",
        a: "Yes — cPanel's Cron Jobs UI is a front-end for the same underlying cron daemon and standard 5-field syntax. Anything valid in a normal crontab works identically when entered through cPanel.",
      },
    ],
  },
  {
    slug: "systemd-timers",
    title: "systemd Timers vs Cron — Syntax, Setup & When to Switch | CronParser",
    metaDescription:
      "How systemd timers work as a modern alternative to cron: OnCalendar syntax, unit file setup, and when timers are actually worth switching to.",
    h1: "systemd Timers vs Cron",
    category: "Operating System",
    intro:
      "systemd timers are the built-in scheduling mechanism on nearly every modern Linux distribution that uses systemd as its init system, offering dependency management, structured logging via journald, and a more expressive calendar syntax than cron's 5 fields — at the cost of needing two unit files instead of one crontab line.",
    syntaxNotes:
      "Timers use OnCalendar= expressions, a different (and more expressive) syntax than cron: DayOfWeek Year-Month-Day Hour:Minute:Second, with wildcards (*), ranges, and steps (/) similar in spirit to cron but not directly interchangeable — for example '*-*-* 02:00:00' for daily at 2 AM, or 'Mon..Fri 09:00' for weekdays at 9 AM.",
    codeExamples: [
      { label: "mybackup.service", code: "[Unit]\nDescription=Run backup script\n\n[Service]\nType=oneshot\nExecStart=/usr/local/bin/backup.sh" },
      { label: "mybackup.timer (daily at 2 AM)", code: "[Unit]\nDescription=Run backup daily\n\n[Timer]\nOnCalendar=*-*-* 02:00:00\nPersistent=true\n\n[Install]\nWantedBy=timers.target" },
      { label: "Enable and start the timer", code: "sudo systemctl enable --now mybackup.timer" },
    ],
    gotchas: [
      "A timer file alone does nothing — it must reference a matching .service file with Type=oneshot, and both files need matching base names (mybackup.timer + mybackup.service) or an explicit Unit= directive pointing to the service.",
      "OnCalendar syntax looks similar to cron at a glance but isn't compatible with it — porting a crontab entry means translating the expression, not copying it verbatim. Use `systemd-analyze calendar 'EXPRESSION'` to preview and validate before deploying.",
      "Without Persistent=true in the [Timer] section, a missed run (machine was off at the scheduled time) is simply skipped rather than caught up on next boot — the closest systemd equivalent to anacron's catch-up behavior.",
    ],
    bestPractices: [
      "Validate any OnCalendar expression with `systemd-analyze calendar 'your-expression' --iterations=5` before enabling the timer — it prints the next several run times so a typo shows up before it causes a missed job.",
      "Use Persistent=true for anything that should catch up after downtime (backups, cleanup jobs) — it's the direct equivalent of cron+anacron's missed-job behavior, and it's off by default.",
      "Check timer status and history with `systemctl list-timers` and `journalctl -u mybackup.service` — systemd's built-in logging is a genuine advantage over plain cron, which requires the job itself to handle its own logging.",
    ],
    faqs: [
      {
        q: "Should I switch from cron to systemd timers?",
        a: "If cron is already meeting your needs, there's little reason to switch. Timers are worth it specifically when you need dependency ordering (run after another service starts), built-in catch-up for missed runs, or centralized logging via journald without setting any of that up yourself.",
      },
      {
        q: "Can I just paste my crontab entry's schedule into OnCalendar?",
        a: "No — the syntaxes aren't compatible. A 5-field cron expression needs to be translated into systemd's OnCalendar format, which uses a different field order and wildcard style, not copied as-is.",
      },
      {
        q: "How do I see when a systemd timer will next run?",
        a: "Run `systemctl list-timers` to see every active timer's next scheduled run, or `systemd-analyze calendar 'OnCalendar-expression'` to preview run times for an expression before deploying it.",
      },
    ],
  },
  {
    slug: "gitlab-ci-cron",
    title: "GitLab CI Scheduled Pipelines — Cron Syntax & Setup | CronParser",
    metaDescription:
      "How to schedule GitLab CI/CD pipelines with cron syntax: the Schedules UI, timezone handling, rules:if conditions, and common gotchas.",
    h1: "GitLab CI Scheduled Pipelines",
    category: "CI/CD",
    intro:
      "GitLab CI/CD supports scheduled pipeline triggers configured through a project's Schedules UI (CI/CD > Schedules), using standard cron syntax under the hood to define when a pipeline runs automatically without a push or merge request event.",
    syntaxNotes:
      "Standard 5-field cron syntax (minute, hour, day-of-month, month, day-of-week), entered directly in the Schedules UI's 'Interval Pattern' field, with a separate timezone dropdown — the schedule always runs against whatever timezone is selected there, not necessarily UTC or the runner's local time.",
    codeExamples: [
      { label: "Restrict a job to only run on the scheduled pipeline", code: "job:\n  rules:\n    - if: '$CI_PIPELINE_SOURCE == \"schedule\"'" },
      { label: "Exclude a job from scheduled pipelines", code: "job:\n  rules:\n    - if: '$CI_PIPELINE_SOURCE == \"schedule\"'\n      when: never\n    - when: on_success" },
      { label: "Common schedule: nightly at 2 AM", code: "0 2 * * *" },
    ],
    gotchas: [
      'Creating a schedule alone doesn\'t limit which jobs run — every job in .gitlab-ci.yml still executes on a scheduled pipeline unless it has an explicit rules: condition checking $CI_PIPELINE_SOURCE == "schedule".',
      "Scheduled pipelines run against the branch or ref configured in the schedule, not necessarily the default branch — a schedule left pointed at an outdated branch keeps running against stale code indefinitely.",
      "GitLab may skip or delay scheduled pipelines under heavy runner load — GitLab's own docs are explicit that schedule times are a target, not a guarantee, the same caveat that applies to GitHub Actions' cron schedules.",
    ],
    bestPractices: [
      'Always gate schedule-only logic behind an explicit if: \'$CI_PIPELINE_SOURCE == "schedule"\' rule rather than assuming a job won\'t run outside the schedule.',
      "Double-check the schedule's target branch after creating it, and again after any branch renaming or restructuring — a schedule silently pointing at a stale or deleted branch is a common source of 'why didn't this run' confusion.",
      "Set the schedule's timezone explicitly rather than assuming UTC, especially for anything tied to business hours or a specific region's off-peak window.",
    ],
    faqs: [
      {
        q: "Do I need cron syntax knowledge to schedule a GitLab pipeline?",
        a: "Yes — the Schedules UI's Interval Pattern field expects standard 5-field cron syntax directly (e.g. 0 2 * * * for nightly at 2 AM), with a separate dropdown for timezone.",
      },
      {
        q: "Why did every job run on my scheduled pipeline, not just the one I wanted?",
        a: 'By default, all jobs in .gitlab-ci.yml run on any pipeline trigger, including scheduled ones. Add a rules: condition checking $CI_PIPELINE_SOURCE == "schedule" to jobs that should only run on the schedule, or use when: never to exclude jobs from it.',
      },
      {
        q: "Is a GitLab scheduled pipeline guaranteed to run at the exact time?",
        a: "No — GitLab documents scheduled pipeline times as approximate, and heavy runner load can delay or occasionally skip a scheduled trigger, the same caveat that applies to GitHub Actions' cron schedules.",
      },
    ],
  },
  {
    slug: "celery-beat-cron",
    title: "Celery Beat Schedule Guide — crontab() Syntax & Setup | CronParser",
    metaDescription:
      "Schedule periodic tasks in Celery with Beat: the crontab() schedule helper, beat_schedule dict syntax, common pitfalls, and Django integration.",
    h1: "Celery Beat Schedule Guide",
    category: "Application Framework",
    intro:
      "Celery Beat is the scheduler component for Celery, Python's most widely used distributed task queue — it periodically kicks off tasks according to a schedule defined in code rather than a separate crontab file, using either simple interval schedules or a crontab()-style helper that mirrors standard cron fields.",
    syntaxNotes:
      "Celery's crontab() helper takes keyword arguments (minute=, hour=, day_of_week=, day_of_month=, month_of_year=) that each accept the same wildcards, ranges, steps, and lists as standard cron fields — just expressed as Python keyword arguments instead of a single 5-field string.",
    codeExamples: [
      {
        label: "Run a task every day at 2:30 AM",
        code: "from celery.schedules import crontab\n\napp.conf.beat_schedule = {\n    'nightly-cleanup': {\n        'task': 'myapp.tasks.cleanup',\n        'schedule': crontab(hour=2, minute=30),\n    },\n}",
      },
      { label: "Run every 15 minutes", code: "'schedule': crontab(minute='*/15')" },
      { label: "Run every weekday at 9 AM", code: "'schedule': crontab(hour=9, minute=0, day_of_week='1-5')" },
    ],
    gotchas: [
      "Celery Beat must run as its own separate process (celery -A myapp beat) alongside the worker process — a common mistake is running only celery worker and wondering why scheduled tasks never fire, since the worker executes tasks but never schedules them.",
      "Running more than one Beat instance simultaneously schedules every task multiple times — Beat is a singleton scheduler by design, so use a single Beat process (or a distributed lock via django-celery-beat's database scheduler) rather than one Beat per worker replica.",
      "crontab(minute='*/15') has the exact same step-value gotcha as plain cron — it only fires at :00, :15, :30, :45, not truly every 15 minutes from whenever the app started.",
    ],
    bestPractices: [
      "Deploy exactly one Beat process per environment, separate from your worker processes — scaling out worker replicas should never mean scaling out Beat.",
      "For dynamic, database-editable schedules (rather than ones baked into code that require a redeploy to change), use the django-celery-beat package's DatabaseScheduler instead of the default file-based one.",
      "Double-check timezone handling — Celery's timezone defaults to UTC unless CELERY_TIMEZONE (or app.conf.timezone) is explicitly set, a common source of schedules firing at unexpected local times.",
    ],
    faqs: [
      {
        q: "Why isn't my Celery Beat schedule running at all?",
        a: "The most common cause is not running a Beat process — celery worker alone executes tasks but never schedules them. You need a separate `celery -A myapp beat` process (or `celery -A myapp worker -B` to run both in one process, fine for development but not recommended in production).",
      },
      {
        q: "Can Celery Beat schedules be edited without redeploying code?",
        a: "Not with the default file-based scheduler, since beat_schedule is defined in application code. Use the django-celery-beat package, which stores schedules in the database and lets you edit them via Django admin or the ORM without a redeploy.",
      },
      {
        q: "Does crontab(minute='*/15') in Celery behave differently from cron's */15?",
        a: "No — it has the exact same semantics as cron: it fires at fixed clock positions (:00, :15, :30, :45), not on a rolling 15-minute timer from whenever the app started or was last restarted.",
      },
    ],
  },
  {
    slug: "rails-whenever-cron",
    title: "Rails Cron Jobs with Whenever — Schedule.rb Syntax | CronParser",
    metaDescription:
      "Schedule background jobs in Ruby on Rails with the whenever gem: schedule.rb syntax, writing a crontab automatically, and common deployment gotchas.",
    h1: "Rails Cron Jobs with Whenever",
    category: "Application Framework",
    intro:
      "Rails has no built-in scheduler — the de facto standard is the whenever gem, which lets you define jobs in a readable Ruby DSL (config/schedule.rb) and generates an actual crontab from it, rather than requiring you to hand-write cron syntax directly.",
    syntaxNotes:
      "Whenever's DSL uses human-readable frequency methods (every 1.day, at: '2:30 am', every :sunday) rather than raw cron fields — it compiles schedule.rb down to a real crontab behind the scenes, viewable by running `whenever` with no arguments before writing it.",
    codeExamples: [
      { label: "config/schedule.rb: daily cleanup at 2:30 AM", code: "every 1.day, at: '2:30 am' do\n  runner \"MyModel.cleanup\"\nend" },
      { label: "Run a rake task every 15 minutes", code: "every 15.minutes do\n  rake \"my_task:run\"\nend" },
      { label: "Write the compiled schedule to the real crontab", code: "whenever --update-crontab" },
    ],
    gotchas: [
      "Editing config/schedule.rb does nothing to the actual crontab by itself — you must run `whenever --update-crontab` (typically as a deploy step, e.g. via Capistrano's whenever integration) to write the compiled schedule into cron.",
      "Whenever's generated crontab jobs run outside your application's Bundler/RVM/rbenv context by default — the gem's environment-setting options (set :output, set :environment, and the job_type templates) exist specifically to work around cron's minimal shell environment, and skipping them is the most common cause of 'works locally, silently fails via cron' bugs.",
      "Deploying without re-running `whenever --update-crontab` leaves the old schedule active — schedule.rb changes have zero effect on a running server until the crontab is regenerated and rewritten.",
    ],
    bestPractices: [
      "Wire `whenever --update-crontab` into your deploy pipeline automatically (Capistrano has an official whenever plugin) rather than remembering to run it by hand after every schedule.rb change.",
      "Always redirect output in schedule.rb jobs (whenever's set :output config, or add >> log/cron.log 2>&1 to a custom job_type) so failures are visible instead of silently swallowed by cron's minimal environment.",
      "Run `whenever` with no arguments locally to preview the exact crontab that will be generated before pushing it to a server — it's the fastest way to catch a DSL mistake before it reaches production.",
    ],
    faqs: [
      {
        q: "Do I need to know cron syntax to use the whenever gem?",
        a: "Not really — whenever's DSL (every 1.day, at: '2:30 am', every :monday) is designed to be readable without cron knowledge, and it compiles down to a real crontab for you. Understanding cron helps when debugging the generated output, though.",
      },
      {
        q: "Why isn't my updated schedule.rb taking effect on the server?",
        a: "Editing schedule.rb only changes a Ruby file — it has no effect on the actual system crontab until you run `whenever --update-crontab`, which regenerates and rewrites the real cron entries. This step is often missing from manual, non-Capistrano deploy processes.",
      },
      {
        q: "Why does my whenever-scheduled job fail via cron but work when I run it manually?",
        a: "Cron jobs run outside your shell's Bundler/rbenv/RVM context by default. Make sure whenever's environment-setting options are configured (set :environment, and the appropriate job_type) so the generated crontab entries load the correct Ruby version and gemset.",
      },
    ],
  },
  {
    slug: "vercel-cron-jobs",
    title: "Vercel Cron Jobs Guide — vercel.json Syntax & Limits | CronParser",
    metaDescription:
      "Schedule serverless functions on Vercel with Cron Jobs: vercel.json syntax, plan-based frequency limits, authentication, and common gotchas.",
    h1: "Vercel Cron Jobs Guide",
    category: "Cloud Scheduler",
    intro:
      "Vercel Cron Jobs let a Next.js (or any Vercel) project trigger a serverless function on a schedule, configured declaratively in vercel.json using standard cron syntax — no separate infrastructure or queue needed, but with plan-based limits on frequency and count that are easy to hit without realizing it.",
    syntaxNotes:
      "Standard 5-field cron syntax in the vercel.json 'crons' array, each entry pairing a 'path' (the API route to invoke) with a 'schedule' string — Vercel always evaluates and runs schedules in UTC, regardless of your project or account's regional settings.",
    codeExamples: [
      { label: "vercel.json: run /api/cleanup daily at midnight UTC", code: "{\n  \"crons\": [\n    {\n      \"path\": \"/api/cleanup\",\n      \"schedule\": \"0 0 * * *\"\n    }\n  ]\n}" },
      { label: "Verify the request came from Vercel's cron system", code: "if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {\n  return new Response('Unauthorized', { status: 401 })\n}" },
      { label: "Multiple schedules in one project", code: "{\n  \"crons\": [\n    { \"path\": \"/api/hourly-sync\", \"schedule\": \"0 * * * *\" },\n    { \"path\": \"/api/daily-report\", \"schedule\": \"0 8 * * *\" }\n  ]\n}" },
    ],
    gotchas: [
      "Vercel's Hobby (free) plan limits cron jobs to once per day per cron and caps the total number of crons per project — a job configured for */15 * * * * on a Hobby plan is silently limited to a single daily run rather than erroring outright, a frequent source of confusion.",
      "Any endpoint used as a cron target is a public URL unless you explicitly verify the request — Vercel recommends checking a bearer token (via a CRON_SECRET environment variable) in the handler, since without it, anyone who discovers the endpoint URL can trigger it manually.",
      "Cron schedules are always evaluated in UTC — there's no per-project timezone setting, so an expression meant for '9 AM local time' needs to be manually offset to the equivalent UTC hour, and that offset shifts with daylight saving time.",
    ],
    bestPractices: [
      "Check your plan's cron limits (frequency and total count) in Vercel's dashboard before deploying a schedule more frequent than daily — Hobby-tier restrictions apply silently rather than with a build-time error.",
      "Always verify the CRON_SECRET bearer token inside the handler function, since Vercel Cron invokes a normal public API route with no built-in access control of its own.",
      "Convert the desired local time to UTC manually when writing the schedule string, and re-check it twice a year around daylight saving transitions if the job is time-sensitive.",
    ],
    faqs: [
      {
        q: "Can I run a Vercel cron job more than once a day on the free plan?",
        a: "No — the Hobby (free) plan restricts cron jobs to a maximum of once per day, regardless of what schedule string you configure; more frequent schedules require a Pro or Enterprise plan.",
      },
      {
        q: "Are Vercel cron endpoints secure by default?",
        a: "No — a cron-configured API route is a normal public endpoint. Vercel recommends checking a bearer token against a CRON_SECRET environment variable inside the handler to prevent anyone else from triggering it.",
      },
      {
        q: "What timezone do Vercel cron schedules run in?",
        a: "Always UTC — there's no per-project timezone configuration, so convert your intended local time to its UTC equivalent when writing the schedule, and account for daylight saving time shifts.",
      },
    ],
  },
  {
    slug: "supabase-pg-cron",
    title: "Supabase Cron (pg_cron) Guide — Scheduling SQL Jobs | CronParser",
    metaDescription:
      "Schedule recurring database jobs in Supabase with the pg_cron extension: cron.schedule() syntax, calling Edge Functions, and common gotchas.",
    h1: "Supabase Cron (pg_cron) Guide",
    category: "Cloud Scheduler",
    intro:
      "Supabase exposes pg_cron, a Postgres extension that runs scheduled jobs directly inside the database using standard cron syntax — useful for periodic SQL maintenance (cleanup, materialized view refreshes) or for triggering a Supabase Edge Function on a schedule via pg_net.",
    syntaxNotes:
      "Standard 5-field cron syntax passed as the first argument to cron.schedule(), alongside the SQL command to run — jobs are managed via SQL function calls rather than a config file, and are stored in the cron.job table inside the database itself.",
    codeExamples: [
      {
        label: "Schedule a nightly cleanup at 2 AM",
        code: "select cron.schedule(\n  'nightly-cleanup',\n  '0 2 * * *',\n  $$ delete from logs where created_at < now() - interval '30 days' $$\n);",
      },
      { label: "List all scheduled jobs", code: "select * from cron.job;" },
      { label: "Unschedule a job by name", code: "select cron.unschedule('nightly-cleanup');" },
    ],
    gotchas: [
      "The pg_cron extension must be explicitly enabled first (via Database > Extensions in the Supabase dashboard, or `create extension pg_cron`) — cron.schedule() calls fail outright on a project where it hasn't been turned on.",
      "pg_cron schedules always run in UTC against the database's own clock, not any per-project timezone setting — the same daylight-saving-offset caveat that applies to most cloud schedulers applies here too.",
      "A failed or long-running scheduled job doesn't surface anywhere obvious by default — check the cron.job_run_details table for run history and errors, since there's no dashboard notification for a silently failing scheduled job.",
    ],
    bestPractices: [
      "Query cron.job_run_details periodically (or wire up alerting on it) rather than assuming a scheduled job succeeded — pg_cron doesn't push failure notifications on its own.",
      "Give every scheduled job an explicit, descriptive name (the first argument to cron.schedule()) rather than leaving it to auto-generate one, since that name is needed to unschedule or look it up later.",
      "For anything beyond simple SQL maintenance — like calling an external API or an Edge Function — pair pg_cron with the pg_net extension to make an async HTTP request from inside the scheduled job.",
    ],
    faqs: [
      {
        q: "Do I need to install anything to use pg_cron on Supabase?",
        a: "You need to enable the pg_cron extension first, either from Database > Extensions in the Supabase dashboard or by running create extension pg_cron via SQL — it isn't enabled by default on a new project.",
      },
      {
        q: "Can pg_cron trigger a Supabase Edge Function, not just SQL?",
        a: "Yes, indirectly — combine pg_cron with the pg_net extension to make an outbound HTTP request to your Edge Function's URL from inside the scheduled job, since pg_cron itself only executes SQL directly.",
      },
      {
        q: "How do I see if a pg_cron job actually ran successfully?",
        a: "Query the cron.job_run_details table, which logs every execution attempt along with its status and any error message — there's no dashboard alert for a failing job, so this table is the primary way to check.",
      },
    ],
  },
]
