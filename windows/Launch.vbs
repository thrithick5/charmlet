' Silent launcher for Windows Desktop Charm
Set WshShell = CreateObject("WScript.Shell")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
batPath = scriptDir & "\run.bat"
WshShell.Run Chr(34) & batPath & Chr(34), 0, False
Set WshShell = Nothing
