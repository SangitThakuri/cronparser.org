export interface CronExample {
  cron: string
  label: string
  category: string
}

export const CRON_EXAMPLE_CATEGORIES = [
  "Common Intervals",
  "Daily Schedules",
  "Weekly Schedules",
  "Monthly & Yearly",
  "Business Hours",
  "DevOps & CI/CD",
  "Backups & Maintenance",
  "Monitoring & Heartbeat",
] as const

export const CRON_EXAMPLES: CronExample[] = [
  // Common Intervals
  { cron: "* * * * *", label: "Every minute", category: "Common Intervals" },
  { cron: "*/2 * * * *", label: "Every 2 minutes", category: "Common Intervals" },
  { cron: "*/5 * * * *", label: "Every 5 minutes", category: "Common Intervals" },
  { cron: "*/10 * * * *", label: "Every 10 minutes", category: "Common Intervals" },
  { cron: "*/15 * * * *", label: "Every 15 minutes", category: "Common Intervals" },
  { cron: "*/30 * * * *", label: "Every 30 minutes", category: "Common Intervals" },
  { cron: "0 * * * *", label: "Every hour, on the hour", category: "Common Intervals" },
  { cron: "0 */2 * * *", label: "Every 2 hours", category: "Common Intervals" },
  { cron: "0 */6 * * *", label: "Every 6 hours", category: "Common Intervals" },
  { cron: "0 */12 * * *", label: "Every 12 hours", category: "Common Intervals" },

  // Daily Schedules
  { cron: "0 0 * * *", label: "Every day at midnight", category: "Daily Schedules" },
  { cron: "0 12 * * *", label: "Every day at noon", category: "Daily Schedules" },
  { cron: "0 6 * * *", label: "Every day at 6:00 AM", category: "Daily Schedules" },
  { cron: "0 9 * * *", label: "Every day at 9:00 AM", category: "Daily Schedules" },
  { cron: "0 18 * * *", label: "Every day at 6:00 PM", category: "Daily Schedules" },
  { cron: "30 23 * * *", label: "Every day at 11:30 PM", category: "Daily Schedules" },
  { cron: "0 0,12 * * *", label: "Twice a day, midnight and noon", category: "Daily Schedules" },

  // Weekly Schedules
  { cron: "0 9 * * 1", label: "Every Monday at 9:00 AM", category: "Weekly Schedules" },
  { cron: "0 17 * * 5", label: "Every Friday at 5:00 PM", category: "Weekly Schedules" },
  { cron: "0 9 * * 1-5", label: "Every weekday at 9:00 AM", category: "Weekly Schedules" },
  { cron: "0 10 * * 0,6", label: "Every weekend at 10:00 AM", category: "Weekly Schedules" },
  { cron: "0 0 * * 0", label: "Every Sunday at midnight", category: "Weekly Schedules" },
  { cron: "0 20 * * 5", label: "Every Friday at 8:00 PM", category: "Weekly Schedules" },

  // Monthly & Yearly
  { cron: "0 0 1 * *", label: "First day of every month at midnight", category: "Monthly & Yearly" },
  { cron: "0 12 15 * *", label: "15th of every month at noon", category: "Monthly & Yearly" },
  { cron: "0 0 1 1,4,7,10 *", label: "First day of every quarter", category: "Monthly & Yearly" },
  { cron: "0 0 1 1 *", label: "Every year on January 1st", category: "Monthly & Yearly" },
  { cron: "0 9 1 * *", label: "First day of every month at 9:00 AM", category: "Monthly & Yearly" },

  // Business Hours
  { cron: "0 9-17 * * 1-5", label: "Every hour during business hours, weekdays", category: "Business Hours" },
  { cron: "*/30 9-17 * * 1-5", label: "Every 30 minutes during business hours", category: "Business Hours" },
  { cron: "0 9 * * 1-5", label: "Start of business day, weekdays at 9:00 AM", category: "Business Hours" },
  { cron: "0 17 * * 1-5", label: "End of business day, weekdays at 5:00 PM", category: "Business Hours" },

  // DevOps & CI/CD
  { cron: "0 2 * * *", label: "Nightly build at 2:00 AM", category: "DevOps & CI/CD" },
  { cron: "0 */4 * * *", label: "CI pipeline every 4 hours", category: "DevOps & CI/CD" },
  { cron: "0 3 * * 1", label: "Weekly dependency update, Monday 3:00 AM", category: "DevOps & CI/CD" },
  { cron: "*/5 * * * *", label: "Health check every 5 minutes", category: "DevOps & CI/CD" },
  { cron: "0 0 * * 1-5", label: "Weekday deployment window at midnight", category: "DevOps & CI/CD" },

  // Backups & Maintenance
  { cron: "0 1 * * *", label: "Daily backup at 1:00 AM", category: "Backups & Maintenance" },
  { cron: "0 3 * * 0", label: "Weekly full backup, Sunday 3:00 AM", category: "Backups & Maintenance" },
  { cron: "0 0 1 * *", label: "Monthly archive, 1st at midnight", category: "Backups & Maintenance" },
  { cron: "0 */6 * * *", label: "Log rotation every 6 hours", category: "Backups & Maintenance" },
  { cron: "0 4 * * 0", label: "Weekly database vacuum, Sunday 4:00 AM", category: "Backups & Maintenance" },

  // Monitoring & Heartbeat
  { cron: "* * * * *", label: "Heartbeat ping every minute", category: "Monitoring & Heartbeat" },
  { cron: "*/2 * * * *", label: "Uptime check every 2 minutes", category: "Monitoring & Heartbeat" },
  { cron: "*/5 * * * *", label: "Health check every 5 minutes", category: "Monitoring & Heartbeat" },
  { cron: "0 * * * *", label: "Hourly status check-in", category: "Monitoring & Heartbeat" },
  { cron: "0 8 * * *", label: "Daily monitoring summary at 8:00 AM", category: "Monitoring & Heartbeat" },
  { cron: "0 9 * * 1", label: "Weekly SSL certificate expiry check, Monday 9:00 AM", category: "Monitoring & Heartbeat" },
]
