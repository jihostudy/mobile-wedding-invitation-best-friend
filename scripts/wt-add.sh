#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "usage: scripts/wt-add.sh <branch> <worktree-path>"
  exit 1
fi

branch="$1"
wt_path="$2"

main_root="$(git rev-parse --show-toplevel)"
main_env="$main_root/.env.local"

git worktree add "$wt_path" "$branch"

if [ -f "$main_env" ]; then
  ln -sfn "$main_env" "$wt_path/.env.local"
  echo "linked: $wt_path/.env.local -> $main_env"
else
  echo "warning: $main_env not found"
fi
