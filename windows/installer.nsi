; ==============================================================================
; Charmlet Windows Installer Script (Charmlet-Setup.exe)
; ==============================================================================
; Produces a modern, professional 1-click Windows installer.
; Installs to user profile ($LOCALAPPDATA\Programs\Charmlet) so no Administrator
; UAC elevation is required. Creates Desktop and Start Menu shortcuts with icons.
; ==============================================================================

!include "MUI2.nsh"
!include "LogicLib.nsh"

; General Definitions
!define PRODUCT_NAME "Charmlet"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Charmlet"
!define PRODUCT_WEB_SITE "https://charmlet.local"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\Charmlet.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKCU"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "..\web\downloads\Charmlet-Setup.exe"
InstallDir "$LOCALAPPDATA\Programs\Charmlet"
InstallDirRegKey HKCU "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show
RequestExecutionLevel user

SetCompressor /SOLID lzma

; Version Information
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey "CompanyName" "${PRODUCT_PUBLISHER}"
VIAddVersionKey "FileDescription" "${PRODUCT_NAME} Installer"
VIAddVersionKey "FileVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "ProductVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "LegalCopyright" "Charmlet - Free Personal Desktop Charm"

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "..\assets\Charmlet.ico"
!define MUI_UNICON "..\assets\Charmlet.ico"

; Installer Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish Page with auto-launch option
!define MUI_FINISHPAGE_RUN "$INSTDIR\Charmlet.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${PRODUCT_NAME} now"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Language
!insertmacro MUI_LANGUAGE "English"

; ------------------------------------------------------------------------------
; Installation Section
; ------------------------------------------------------------------------------
Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    SetOverwrite on

    ; Terminate any running instance before updating
    nsExec::Exec 'taskkill /F /IM Charmlet.exe /T'

    ; Application Executable, runtime DLLs, and resources
    File /r "dist\Charmlet-win32-x64\*.*"

    ; Register URL protocols charmlet:// and luckydangle://
    WriteRegStr HKCU "Software\Classes\charmlet" "" "URL:Charmlet Protocol"
    WriteRegStr HKCU "Software\Classes\charmlet" "URL Protocol" ""
    WriteRegStr HKCU "Software\Classes\charmlet\DefaultIcon" "" "$INSTDIR\Charmlet.exe,0"
    WriteRegStr HKCU "Software\Classes\charmlet\shell\open\command" "" '"$INSTDIR\Charmlet.exe" "%1"'

    WriteRegStr HKCU "Software\Classes\luckydangle" "" "URL:LuckyDangle Protocol"
    WriteRegStr HKCU "Software\Classes\luckydangle" "URL Protocol" ""
    WriteRegStr HKCU "Software\Classes\luckydangle\DefaultIcon" "" "$INSTDIR\Charmlet.exe,0"
    WriteRegStr HKCU "Software\Classes\luckydangle\shell\open\command" "" '"$INSTDIR\Charmlet.exe" "%1"'

    ; Shortcuts
    CreateDirectory "$SMPROGRAMS\Charmlet"
    CreateShortcut "$SMPROGRAMS\Charmlet\Charmlet.lnk" "$INSTDIR\Charmlet.exe" "" "$INSTDIR\Charmlet.exe" 0
    CreateShortcut "$SMPROGRAMS\Charmlet\Uninstall Charmlet.lnk" "$INSTDIR\Uninstall.exe"
    CreateShortcut "$DESKTOP\Charmlet.lnk" "$INSTDIR\Charmlet.exe" "" "$INSTDIR\Charmlet.exe" 0
SectionEnd

Section -Post
    ; Create Uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; Register in Add/Remove Programs (HKCU)
    WriteRegStr HKCU "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\Charmlet.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\Charmlet.exe,0"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
    WriteRegDWORD ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "NoModify" 1
    WriteRegDWORD ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "NoRepair" 1
SectionEnd

; ------------------------------------------------------------------------------
; Uninstallation Section
; ------------------------------------------------------------------------------
Section Uninstall
    nsExec::Exec 'taskkill /F /IM Charmlet.exe /T'

    ; Remove Shortcuts
    Delete "$DESKTOP\Charmlet.lnk"
    Delete "$SMPROGRAMS\Charmlet\Charmlet.lnk"
    Delete "$SMPROGRAMS\Charmlet\Uninstall Charmlet.lnk"
    RMDir "$SMPROGRAMS\Charmlet"

    ; Remove Installed Files
    RMDir /r "$INSTDIR"

    ; Remove Registry Keys
    DeleteRegKey HKCU "Software\Classes\charmlet"
    DeleteRegKey HKCU "Software\Classes\luckydangle"
    DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
    DeleteRegKey HKCU "${PRODUCT_DIR_REGKEY}"

    SetAutoClose true
SectionEnd
