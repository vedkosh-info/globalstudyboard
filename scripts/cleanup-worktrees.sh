#!/bin/bash
# cleanup-worktrees.sh — safely remove old Claude worktrees.
#
# Deletes a worktree ONLY if BOTH are true:
#   1. fully deployed  — every commit is already on origin/main (nothing unpushed)
#   2. stale           — no source file touched in the last N days (default 7)
# Any uncommitted scratch in an eligible worktree is BACKED UP first, then removed.
# Never touches the main checkout, the current directory, or unpushed work.
#
# Usage:
#   ./scripts/cleanup-worktrees.sh           # DRY RUN, 7-day threshold (preview only)
#   ./scripts/cleanup-worktrees.sh 5         # DRY RUN, 5-day threshold
#   ./scripts/cleanup-worktrees.sh 7 --go    # actually delete (deployed + >7d), backup-first
set -u

DAYS=7; GO=0
for a in "$@"; do
  case "$a" in
    --go) GO=1 ;;
    ''|*[!0-9]*) : ;;          # ignore non-numeric args
    *) DAYS="$a" ;;
  esac
done

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Not a git repo."; exit 1; }
MAIN_ROOT=$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')
REPO_NAME=$(basename "$MAIN_ROOT")
BACKUPS="$(dirname "$MAIN_ROOT")/${REPO_NAME}-worktree-backups"
CUR=$(git rev-parse --show-toplevel 2>/dev/null)

echo "Fetching origin/main (best-effort)…"
git fetch origin main --quiet 2>/dev/null || echo "  offline — using last-known origin/main"
REF=origin/main
git rev-parse --verify "$REF" >/dev/null 2>&1 || REF=main
git rev-parse --verify "$REF" >/dev/null 2>&1 || REF=master

THRESH=$(date -v-"${DAYS}"d '+%Y-%m-%d %H:%M:%S' 2>/dev/null) \
  || THRESH=$(date -d "-${DAYS} days" '+%Y-%m-%d %H:%M:%S' 2>/dev/null)

if [ "$GO" -eq 1 ]; then echo "MODE: EXECUTE — eligible worktrees WILL be deleted"
else echo "MODE: DRY-RUN — preview only (add --go to delete)"; fi
echo "Repo: $REPO_NAME   deployed-ref: $REF   stale-after: ${DAYS} days"
echo "Free before: $(df -h / | awk 'NR>1{print $4; exit}')"
echo "==========================================================="

del=0; keep=0; wt=""; br=""

decide() {
  local wt="$1" br="$2" name; name=$(basename "$wt")
  [ "$wt" = "$MAIN_ROOT" ] && return
  case "$br" in main|master) return ;; esac
  if [ "$wt" = "$CUR" ]; then echo "  keep  $name  — current directory"; keep=$((keep+1)); return; fi

  # 1) fully deployed to origin/main?
  local ahead; ahead=$(git -C "$wt" rev-list --count "$REF"..HEAD 2>/dev/null)
  if [ "${ahead:-1}" != "0" ]; then
    echo "  KEEP  $name  — ${ahead:-?} commit(s) NOT on $REF (not deployed)"; keep=$((keep+1)); return
  fi
  # 2) stale? (no source file changed within DAYS; build/output dirs ignored)
  local recent; recent=$(find "$wt" \
      \( -name node_modules -o -name .next -o -name .git -o -name .gradle \
         -o -name allure-results -o -name coverage \) -prune -o \
      -type f -newermt "$THRESH" -print 2>/dev/null | head -n1)
  if [ -n "$recent" ]; then
    echo "  keep  $name  — touched within ${DAYS}d"; keep=$((keep+1)); return
  fi

  local dirty; dirty=$(git -C "$wt" status --porcelain 2>/dev/null)
  if [ "$GO" -ne 1 ]; then
    echo "  WOULD DELETE  $name  — deployed + stale${dirty:+ (uncommitted scratch → will back up first)}"
    del=$((del+1)); return
  fi

  # EXECUTE: back up uncommitted scratch, then remove
  if [ -n "$dirty" ]; then
    local dst="$BACKUPS/$name"; mkdir -p "$dst"
    git -C "$wt" diff HEAD --binary > "$dst/tracked.patch" 2>/dev/null
    git -C "$wt" ls-files --others --exclude-standard 2>/dev/null \
      | tar -czf "$dst/untracked.tgz" -C "$wt" -T - 2>/dev/null
    { echo "branch: $br"; echo "HEAD: $(git -C "$wt" rev-parse HEAD 2>/dev/null)";
      echo "--- status ---"; printf '%s\n' "$dirty"; } > "$dst/info.txt"
  fi
  if git -C "$MAIN_ROOT" worktree remove --force "$wt" 2>/dev/null; then
    echo "  DELETED  $name${dirty:+  (backed up)}"; del=$((del+1))
  else
    echo "  FAILED   $name  (left in place)"; keep=$((keep+1))
  fi
}

while IFS= read -r line; do
  case "$line" in
    "worktree "*) wt="${line#worktree }" ;;
    "branch "*)   br="${line#branch refs/heads/}" ;;
    "detached")   br="(detached)" ;;
    "")           [ -n "$wt" ] && decide "$wt" "$br"; wt=""; br="" ;;
  esac
done < <(git worktree list --porcelain)
[ -n "$wt" ] && decide "$wt" "$br"

[ "$GO" -eq 1 ] && git -C "$MAIN_ROOT" worktree prune 2>/dev/null

echo "==========================================================="
if [ "$GO" -eq 1 ]; then
  echo "Deleted: $del    Kept: $keep"
  [ -d "$BACKUPS" ] && echo "Backups: $BACKUPS ($(du -sh "$BACKUPS" 2>/dev/null | awk '{print $1}'))"
else
  echo "Would delete: $del    Keep: $keep    →  re-run with --go to apply"
fi
echo "Free now: $(df -h / | awk 'NR>1{print $4; exit}')"
