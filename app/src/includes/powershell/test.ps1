param([string]$name)
$SW_MAXIMIZE = 3
$sig = @'

[DllImport("user32.dll")]
public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
'@
Add-Type -MemberDefinition $sig -Name Functions -Namespace Win32

$hWnd = (Get-Process -id $name).MainWindowHandle
[Win32.Functions]::ShowWindow($hWnd, $SW_MAXIMIZE)