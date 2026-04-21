[Setup]
AppId={{B7A1C9E2-8F5A-4D2B-9F2E-TSNAG001}} ; unique GUID (keep constant across versions)
AppName=TubeSnag
AppVersion=1.0.0
AppPublisher=Shawan Mandal
AppPublisherURL=https://www.imshawan.dev
AppSupportURL=https://github.com/imshawan/tubesnag-desktop/issues
AppUpdatesURL=https://github.com/imshawan/tubesnag-desktop/releases

AppContact=github@imshawan.dev
AppComments=A modern desktop application for downloading content and playlists from YouTube

DefaultDirName={localappdata}\TubeSnag
DefaultGroupName=TubeSnag

OutputDir=out/installer
OutputBaseFilename=TubeSnag-Setup

SetupIconFile=assets\icons\icon.ico
UninstallDisplayIcon={app}\TubeSnag.exe

Compression=lzma
SolidCompression=yes
WizardStyle=modern

DisableDirPage=no
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

VersionInfoVersion=1.0.0
VersionInfoCompany=Shawan Mandal
VersionInfoDescription=TubeSnag Installer
VersionInfoCopyright=Copyright (c) 2026 Shawan Mandal <github@imshawan.dev>

ShowLanguageDialog=no
LicenseFile=LICENSE

[Files]
Source: "out\tubesnag-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\TubeSnag"; Filename: "{app}\TubeSnag.exe"
Name: "{commondesktop}\TubeSnag"; Filename: "{app}\TubeSnag.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"; Flags: unchecked

[Run]
Filename: "{app}\TubeSnag.exe"; Description: "Launch TubeSnag"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"