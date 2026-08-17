/**
 * The admin area. It shipped with its strings written inline, which is why it
 * was the one screen that stayed English while the rest of the UI followed the
 * catalogue — the reason no user-facing string is written at a call site.
 */
export const admin = {
  'admin.title': 'Admin',
  'admin.subtitle': 'Manage users, their triggers and view platform metrics',
  'admin.denied': 'Access denied',
  'admin.deniedHint': 'You need an admin account to view this page.',

  'admin.stats.loading': 'Loading stats',
  'admin.stats.users': 'Users',
  'admin.stats.verified': 'Verified',
  'admin.stats.admins': 'Admins',
  'admin.stats.triggers': 'Triggers',
  'admin.stats.activeTriggers': 'Active triggers',
  'admin.stats.pinnedCities': 'Pinned cities',
  'admin.stats.notificationsSent': 'Notifications sent',
  'admin.stats.notificationsFailed': 'Notifications failed',

  'admin.users.heading': 'Users',
  'admin.users.loading': 'Loading users',
  'admin.users.empty': 'No users',
  'admin.users.email': 'Email',
  'admin.users.role': 'Role',
  'admin.users.triggers': 'Triggers',
  'admin.users.joined': 'Joined',
  'admin.users.unverified': 'unverified',
  'admin.users.pagination': 'Users pagination',
  'admin.users.prev': '← Prev',
  'admin.users.next': 'Next →',
  'admin.users.page': 'Page {page} of {total}',

  'admin.user.details': 'Details for {email}',
  'admin.user.meta':
    'Joined {date} · {notifications} notifications · {pinned} pinned',
  'admin.user.markVerified': 'Mark verified',
  'admin.user.unverify': 'Unverify email',
  'admin.user.promote': 'Promote to admin',
  'admin.user.demote': 'Demote to user',
  'admin.user.selfRole': 'You cannot change your own role',
  'admin.user.emailVerified': 'Email verified',
  'admin.user.emailUnverified': 'Email unverified',
  'admin.user.telegramLinked': 'Telegram linked',
  'admin.user.telegramNone': 'No Telegram',
  'admin.user.quiet': 'Quiet {from}–{to}',
  'admin.user.triggers': 'Triggers ({count})',
  'admin.user.noTriggers': 'No triggers.',
  'admin.user.paused': 'paused',
  'admin.user.deleteUser': 'Delete user',
  'admin.user.deleteUserTitle': 'Delete this user?',
  'admin.user.deleteUserMessage':
    'This permanently removes {email} and all of their triggers, notifications and pinned cities. This cannot be undone.',
  'admin.user.deleteTrigger': 'Delete trigger',
  'admin.user.deleteTriggerLabel': 'Delete trigger {name}',
  'admin.user.deleteTriggerTitle': 'Delete this trigger?',
  'admin.user.deleteTriggerMessage':
    'Permanently delete "{name}" belonging to {email}.',
} as const;
