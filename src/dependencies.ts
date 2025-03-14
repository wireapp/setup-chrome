import * as core from "@actions/core";
import { pkg, runtime } from "actions-swing";
import type { Platform } from "./platform";

const DEBIAN_BASED_DEPENDENT_PACKAGES = [
  "libglib2.0-0",
  "libgconf-2-4",
  "libatk1.0-0",
  "libatk-bridge2.0-0",
  "libgdk-pixbuf2.0-0",
  "libgtk-3-0",
  "libgbm-dev",
  "libnss3-dev",
  "libxss-dev",
  "libasound2",
  "xvfb",
  "fonts-liberation",
  "libu2f-udev",
  "xdg-utils",
];

const UBUNTU_24_DEPENDENT_PACKAGES = [
  "libasound2t64",
  "libatk-bridge2.0-0t64",
  "libatk1.0-0t64",
  "libcairo2",
  "libcups2t64",
  "libdbus-1-3",
  "libexpat1",
  "libgbm1",
  "libglib2.0-0t64",
  "libnss3",
  "libpango-1.0-0",
  "libxcomposite1",
  "libxdamage1",
  "libxfixes3",
  "libxkbcommon0",
  "libxrandr2",
];

const FEDORA_BASED_DEPENDENT_PACKAGES = [
  "alsa-lib",
  "atk",
  "at-spi2-atk",
  "cups-libs",
  "libdrm",
  "libXcomposite",
  "libXdamage",
  "libxkbcommon",
  "libXrandr",
  "mesa-libgbm",
  "nss",
  "pango",
];

const SUSE_BASED_DEPENDENT_PACKAGES = [
  "libasound2",
  "libatk-1_0-0",
  "libatk-bridge-2_0-0",
  "libcups2",
  "libdbus-1-3",
  "libdrm2",
  "libgbm1",
  "libgobject-2_0-0",
  "libpango-1_0-0",
  "libXcomposite1",
  "libXdamage1",
  "libXfixes3",
  "libxkbcommon0",
  "libXrandr2",
  "mozilla-nss",
];

const installDependencies = async (
  platform: Platform,
  { noSudo }: { noSudo: boolean },
) => {
  if (platform.os !== "linux") {
    core.warning(
      `install-dependencies is only supported on Linux, but current platform is ${platform.os}`,
    );
    return;
  }

  const packages = await (async () => {
    const { ID: id, VERSION_ID: versionId } = await runtime.loadOsRelease();
    switch (id) {
      case "rhel":
      case "centos":
      case "ol":
      case "fedora":
        return FEDORA_BASED_DEPENDENT_PACKAGES;
      case "debian":
      case "linuxmint":
        return DEBIAN_BASED_DEPENDENT_PACKAGES;
      case "ubuntu":
        return Number.parseInt(versionId.split(".")[0], 10) >= 24
          ? UBUNTU_24_DEPENDENT_PACKAGES
          : DEBIAN_BASED_DEPENDENT_PACKAGES;
      case "opensuse":
      case "opensuse-leap":
      case "sles":
        return SUSE_BASED_DEPENDENT_PACKAGES;
    }
    throw new Error(`Unsupported OS: ${id}`);
  })();
  const sudo = !noSudo && process.getuid?.() !== 0;

  await pkg.install(packages, { sudo });
};

export { installDependencies };
