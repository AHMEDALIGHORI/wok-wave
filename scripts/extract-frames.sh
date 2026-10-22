#!/usr/bin/env sh
# POSIX entry point. Windows npm run frames invokes the same ffmpeg pipeline directly.
set -eu
cd "${0%/*}/.."
exec node --experimental-strip-types scripts/extract-frames.mts "$@"

