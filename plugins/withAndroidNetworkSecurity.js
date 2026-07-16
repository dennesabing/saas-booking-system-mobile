const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');
const os = require('os');

function findMkcertCA() {
  // mkcert stores the root CA in a platform-specific location
  const candidates = [
    process.env.CAROOT,
    path.join(os.homedir(), 'AppData', 'Local', 'mkcert'),  // Windows
    path.join(os.homedir(), 'Library', 'Application Support', 'mkcert'),  // macOS
    path.join(os.homedir(), '.local', 'share', 'mkcert'),  // Linux
  ].filter(Boolean);

  for (const dir of candidates) {
    const certPath = path.join(dir, 'rootCA.pem');
    if (fs.existsSync(certPath)) return certPath;
  }
  return null;
}

// Embeds the mkcert dev CA and configures Android to trust it — fixes HTTPS to .local domains in dev.
const withAndroidNetworkSecurity = (config) => {
  config = withDangerousMod(config, [
    'android',
    (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;

      const xmlDir = path.join(projectRoot, 'app', 'src', 'main', 'res', 'xml');
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(
        path.join(xmlDir, 'network_security_config.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system" />
      <certificates src="@raw/dev_ca" />
    </trust-anchors>
  </base-config>
</network-security-config>`
      );

      const rawDir = path.join(projectRoot, 'app', 'src', 'main', 'res', 'raw');
      fs.mkdirSync(rawDir, { recursive: true });

      const caPath = findMkcertCA();
      if (!caPath) {
        throw new Error(
          'withAndroidNetworkSecurity: mkcert root CA not found. Run `mkcert -install` first.'
        );
      }
      fs.copyFileSync(caPath, path.join(rawDir, 'dev_ca.pem'));
      console.log(`[withAndroidNetworkSecurity] Embedded mkcert CA from ${caPath}`);

      return config;
    },
  ]);

  config = withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    }
    return config;
  });

  return config;
};

module.exports = withAndroidNetworkSecurity;
