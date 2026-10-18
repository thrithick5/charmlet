; ==============================================================================
; Charmlet Windows Silent Launcher (Charmlet.exe)
; ==============================================================================
; Compiles to a lightweight native Windows executable that launches Charmlet in a
; standalone, borderless app window via Microsoft Edge or Google Chrome without
; opening any command prompt or terminal window.
; ==============================================================================

!include "LogicLib.nsh"

Name "Charmlet"
Caption "Charmlet"
OutFile "Charmlet.exe"
Icon "../assets/Charmlet.ico"
SilentInstall silent
RequestExecutionLevel user

VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "Charmlet"
VIAddVersionKey "CompanyName" "Charmlet"
VIAddVersionKey "FileDescription" "Charmlet Desktop Charm"
VIAddVersionKey "FileVersion" "1.0.0"
VIAddVersionKey "ProductVersion" "1.0.0"
VIAddVersionKey "LegalCopyright" "Charmlet - Free Personal Desktop Charm"

Var HTML_FILE
Var BROWSER_PATH

Section ""
    ; 1. Locate charm.html relative to this executable
    ${If} ${FileExists} "$EXEDIR\web\charm.html"
        StrCpy $HTML_FILE "$EXEDIR\web\charm.html"
    ${ElseIf} ${FileExists} "$EXEDIR\charm.html"
        StrCpy $HTML_FILE "$EXEDIR\charm.html"
    ${Else}
        MessageBox MB_ICONSTOP "Cannot locate Charmlet files (charm.html not found in $EXEDIR)."
        Quit
    ${EndIf}

    ; 2. Check for Microsoft Edge (Registry: App Paths)
    ReadRegStr $BROWSER_PATH HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" ""
    ${If} $BROWSER_PATH != ""
    ${AndIf} ${FileExists} "$BROWSER_PATH"
        Exec '"$BROWSER_PATH" --app="file:///$HTML_FILE" --window-size=380,560 --window-position=960,0'
        Quit
    ${EndIf}

    ; Check Edge default program file paths
    ${If} ${FileExists} "$PROGRAMFILES64\Microsoft\Edge\Application\msedge.exe"
        Exec '"$PROGRAMFILES64\Microsoft\Edge\Application\msedge.exe" --app="file:///$HTML_FILE" --window-size=380,560 --window-position=960,0'
        Quit
    ${EndIf}
    ${If} ${FileExists} "$PROGRAMFILES\Microsoft\Edge\Application\msedge.exe"
        Exec '"$PROGRAMFILES\Microsoft\Edge\Application\msedge.exe" --app="file:///$HTML_FILE" --window-size=380,560 --window-position=960,0'
        Quit
    ${EndIf}
    ${If} ${FileExists} "$LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
        Exec '"$LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe" --app="file:///$HTML_FILE" --window-size=380,560 --window-position=960,0'
        Quit
    ${EndIf}

    ; 3. Check for Google Chrome (Registry: App Paths)
    ReadRegStr $BROWSER_PATH HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" ""
    ${If} $BROWSER_PATH != ""
    ${AndIf} ${FileExists} "$BROWSER_PATH"
        Exec '"$BROWSER_PATH" --app="file:///$HTML_FILE" --window-size=380,560 --window-position=960,0'
        Quit
    ${EndIf}

    ${If} ${FileExists} "$PROGRAMFILES64\Google\Chrome\Application\chrome.exe"
        Exec '"$PROGRAMFILES64\Google\Chrome\Application\chrome.exe" --app="file:///$HTML_FILE" --window-size=380,560 --window-position=960,0'
        Quit
    ${EndIf}
    ${If} ${FileExists} "$PROGRAMFILES\Google\Chrome\Application\chrome.exe"
        Exec '"$PROGRAMFILES\Google\Chrome\Application\chrome.exe" --app="file:///$HTML_FILE" --window-size=380,560 --window-position=960,0'
        Quit
    ${EndIf}
    ${If} ${FileExists} "$LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
        Exec '"$LOCALAPPDATA\Google\Chrome\Application\chrome.exe" --app="file:///$HTML_FILE" --window-size=380,560 --window-position=960,0'
        Quit
    ${EndIf}

    ; 4. Fallback: Open in default browser
    ExecShell "open" "$HTML_FILE"
SectionEnd
