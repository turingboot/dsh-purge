#!/bin/bash
set -euo pipefail

export COPYFILE_DISABLE=1

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/dist}"
VERSION="$(cd "$ROOT_DIR" && node -p "JSON.parse(require('fs').readFileSync('package.json','utf8')).version")"
PACKAGE_NAME="dsh-purge-${VERSION}.pkg"
TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/dsh-purge-pkg.XXXXXX")"
PAYLOAD_DIR="$TEMP_DIR/payload"
SCRIPT_DIR="$TEMP_DIR/scripts"
PLUGIN_DIR="$PAYLOAD_DIR/Library/Application Support/dsh-purge/plugin"
HELPER_DIR="$PAYLOAD_DIR/usr/local/bin"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

mkdir -p "$PLUGIN_DIR" "$HELPER_DIR" "$SCRIPT_DIR" "$OUTPUT_DIR"

TARBALL="$(cd "$ROOT_DIR" && npm pack --ignore-scripts --pack-destination "$TEMP_DIR" | tail -n 1)"
tar -xzf "$TEMP_DIR/$TARBALL" -C "$PLUGIN_DIR" --strip-components=1
cp "$ROOT_DIR/packaging/macos/postinstall" "$SCRIPT_DIR/postinstall"
cp "$ROOT_DIR/packaging/macos/dsh-harness-restart" "$HELPER_DIR/dsh-harness-restart"
chmod 755 "$SCRIPT_DIR/postinstall"
chmod 755 "$HELPER_DIR/dsh-harness-restart"
xattr -cr "$PAYLOAD_DIR" "$SCRIPT_DIR"
find "$PAYLOAD_DIR" "$SCRIPT_DIR" -type f -name '._*' -delete

rm -f "$OUTPUT_DIR/$PACKAGE_NAME"
pkgbuild \
  --root "$PAYLOAD_DIR" \
  --scripts "$SCRIPT_DIR" \
  --install-location / \
  --identifier io.github.yujunzhixue.dsh-purge \
  --version "$VERSION" \
  --ownership recommended \
  "$OUTPUT_DIR/$PACKAGE_NAME"

echo "$OUTPUT_DIR/$PACKAGE_NAME"
