#!/usr/bin/env bash
set -euo pipefail

matches="$(grep -RInE --include='*.css' --include='*.jsx' --include='*.js' 'font-family:[^;]*(Tahoma|Arial|sans-serif|serif)' app components 2>/dev/null || true)"
if [[ -n "$matches" ]]; then
  echo "Disallowed font fallback found. TalaNama must use Vazirmatn only:" >&2
  echo "$matches" >&2
  exit 1
fi

echo "Vazirmatn-only typography check passed"
