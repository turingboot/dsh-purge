# macOS personal installer

Build an unsigned local installer for the DeepSeek Harness desktop profile:

```sh
./scripts/build-macos-pkg.sh
```

The package installs the plugin payload under `/Library/Application Support/dsh-purge`,
then its `postinstall` script:

1. locates the logged-in user's DeepSeek Harness desktop profile;
2. fully stops the desktop app and any detached host process;
3. backs up `profiles/desktop/package.json`;
4. registers the packaged payload through Harness's own `dsh plugin` manager;
5. verifies the installed dependency and rolls back on failure;
6. reopens the installed copy of DeepSeek Harness.

The macOS bundle configuration skips the expensive all-host startup recovery scan that
can block Electron before port 19387 is ready. Explicit Apply/Restore operations keep
their normal backup and recovery behavior. The installer does not click Apply; use the
dsh-purge sidebar after launch to apply the desired changes.

This package is unsigned and intended for local personal use. Distribution requires an
Apple Developer Installer certificate, notarization, and review of the upstream license
and attribution requirements.
