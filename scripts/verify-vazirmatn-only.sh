#!/usr/bin/env bash
set -euo pipefail

scan_dirs=()
for dir in app components lib; do
  [[ -d "$dir" ]] && scan_dirs+=("$dir")
done

if ((${#scan_dirs[@]} == 0)); then
  echo "Typography check failed: no source directories were found." >&2
  exit 1
fi

if grep -RniE 'Tahoma|Arial|Times New Roman|sans-serif|serif' \
  "${scan_dirs[@]}" \
  --include='*.css' --include='*.js' --include='*.jsx' --include='*.ts' --include='*.tsx'; then
  echo "Typography check failed: only Vazirmatn is allowed." >&2
  exit 1
fi

if ! grep -Rqi 'Vazirmatn' app; then
  echo "Typography check failed: Vazirmatn was not found in app sources." >&2
  exit 1
fi

echo "Typography check passed: Vazirmatn-only."
