#define MyAppName "Donutglaze"
#define MyAppVersion "1"
#define MyAppPublisher "Donutglaze"
#define MyAppURL "http://www.donutglaze.com"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\Donutglaze
DefaultGroupName={#MyAppName}
CreateAppDir=yes
OutputBaseFilename=donutglaze_installer
Compression=none
SolidCompression=yes
AlwaysShowDirOnReadyPage=yes
ChangesAssociations=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Registry]
Root: HKLM; Subkey: "Software\{#MyAppName}"; ValueType: string; ValueName: "ResourcePath"; ValueData: "{app}"; Flags: uninsdeletekey

Root: HKCR; Subkey: "{#MyAppName}"; ValueType: string; ValueName: ""; ValueData: "Program {#MyAppName}"; Flags: uninsdeletekey
Root: HKCR; Subkey: "{#MyAppName}\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppName}.exe,0"
Root: HKCR; Subkey: "{#MyAppName}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppName}.exe"" ""%1"""

Root: HKCR; Subkey: ".torrent"; ValueType: string; ValueName: ""; ValueData: "{#MyAppName}"; Flags: uninsdeletevalue
Root: HKCR; Subkey: ".torrent"; ValueType: string; ValueName: "Content Type"; ValueData: "application/x-bittorrent"; Flags: uninsdeletevalue
Root: HKCR; Subkey: ".torrent\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppName}.exe,0"
Root: HKCR; Subkey: ".torrent\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppName}.exe"" ""%1"""

Root: HKCR; Subkey: "magnet"; ValueType: string; ValueName: ""; ValueData: "{#MyAppName}"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "magnet"; ValueType: string; ValueName: "Content Type"; ValueData: "application/x-magnet"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "magnet"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCR; Subkey: "magnet\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppName}.exe,0"
Root: HKCR; Subkey: "magnet\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppName}.exe"" ""%1"""

Root: HKLM; Subkey: "Software\Classes\{#MyAppName}"; ValueType: string; ValueName: ""; ValueData: "Program {#MyAppName}"; Flags: uninsdeletekey
Root: HKLM; Subkey: "Software\Classes\{#MyAppName}\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppName}.exe,0"
Root: HKLM; Subkey: "Software\Classes\{#MyAppName}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppName}.exe"" ""%1"""

Root: HKLM; Subkey: "Software\Classes\.torrent"; ValueType: string; ValueName: ""; ValueData: "{#MyAppName}"; Flags: uninsdeletevalue
Root: HKLM; Subkey: "Software\Classes\.torrent"; ValueType: string; ValueName: "Content Type"; ValueData: "application/x-bittorrent"; Flags: uninsdeletevalue
Root: HKLM; Subkey: "Software\Classes\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppName}.exe,0"
Root: HKLM; Subkey: "Software\Classes\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppName}.exe"" ""%1"""

Root: HKLM; Subkey: "Software\Classes\magnet"; ValueType: string; ValueName: ""; ValueData: "{#MyAppName}"; Flags: uninsdeletevalue
Root: HKLM; Subkey: "Software\Classes\magnet"; ValueType: string; ValueName: "Content Type"; ValueData: "application/x-magnet"; Flags: uninsdeletevalue
Root: HKLM; Subkey: "Software\Classes\magnet"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""; Flags: uninsdeletevalue
Root: HKLM; Subkey: "Software\Classes\magnet\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppName}.exe,0"
Root: HKLM; Subkey: "Software\Classes\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppName}.exe"" ""%1"""

[Icons]
Name: "{group}\Donutglaze"; Filename: "{app}\Donutglaze.exe"
Name: "{commondesktop}\Donutglaze"; Filename: "{app}\Donutglaze.exe"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\Donutglaze"; Filename: "{app}\Donutglaze.exe"

[Files]
Source: "..\dist\Donutglaze.exe"; DestDir: "{app}";
Source: "..\static\*"; DestDir: "{app}\static"; Flags: recursesubdirs createallsubdirs
Source: "..\templates\*"; DestDir: "{app}\templates"; Flags: recursesubdirs createallsubdirs
Source: "logo32.ico"; DestDir: "{app}";

[Run]
Filename: "netsh"; StatusMsg: "Configuring Firewall"; Parameters: "advfirewall firewall add rule name=""Allow Donutglaze"" dir=in program=""{app}\Donutglaze.exe"" security=authnoencap action=allow"
Filename: "{app}\Donutglaze.exe"; Description: "Run Donutglaze"; Flags: postinstall hidewizard shellexec
