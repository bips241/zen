Native Android module placeholders.

Files to implement (Kotlin/Java):
 - LauncherActivity.kt (ACTION_MAIN + CATEGORY_HOME)
 - FocusForegroundService.kt (foreground service to keep shell alive)
 - FocusNotificationListener.kt (NotificationListenerService to suppress notifications)
 - UsageAccessHelper.kt (helper to check UsageStats/Accessibility)

Place these files under android/app/src/main/java/... when migrating to the Bare workflow.
