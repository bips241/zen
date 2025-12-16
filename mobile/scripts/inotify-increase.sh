#!/usr/bin/env bash
# Helper: increase inotify watches (requires sudo)
# Run these commands on your development machine (Linux)

echo "This script will suggest commands to increase inotify watches. Run them with sudo."

echo "1) Add the setting to /etc/sysctl.conf"
echo "sudo sh -c 'echo fs.inotify.max_user_watches=524288 >> /etc/sysctl.conf'"

echo "2) Reload sysctl settings"
echo "sudo sysctl -p"

echo "You can run the above two commands manually."
