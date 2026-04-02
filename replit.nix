{pkgs}: {
  deps = [
    pkgs.gtk3
    pkgs.dbus
    pkgs.alsa-lib
    pkgs.cairo
    pkgs.pango
    pkgs.libdrm
    pkgs.cups
    pkgs.at-spi2-atk
    pkgs.nss
    pkgs.xorg.libxcb
    pkgs.xorg.libXrandr
    pkgs.xorg.libXfixes
    pkgs.xorg.libXext
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcomposite
    pkgs.xorg.libX11
    pkgs.mesa
    pkgs.chromium
  ];
}
