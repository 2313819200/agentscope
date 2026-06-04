# AgentScope 桌面启动器
param([switch]$Dev)

$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 确保 Vite 在跑
$viteRunning = $false
try {
  $res = Invoke-WebRequest -Uri "http://localhost:3333" -TimeoutSec 2 -ErrorAction Stop
  $viteRunning = $res.StatusCode -eq 200
} catch {}

if (-not $viteRunning) {
  Write-Host "Starting dev server..."
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "npx"
  $psi.Arguments = "vite --port 3333"
  $psi.WorkingDirectory = $AppDir
  $psi.UseShellExecute = $true
  $psi.CreateNoWindow = $false
  [System.Diagnostics.Process]::Start($psi) | Out-Null
  Start-Sleep 3
}

try {
  # 用 Windows 原生 WebView2 创建桌面窗口
  Add-Type -AssemblyName PresentationCore, PresentationFramework, WindowsBase

  $xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="AgentScope"
        Width="1200" Height="800"
        WindowStartupLocation="CenterScreen"
        Background="#0a0a0f">
  <Grid>
    <WebView2 x:Name="web" Source="http://localhost:3333" />
  </Grid>
</Window>
"@

  $reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]$xaml)
  $window = [System.Windows.Markup.XamlReader]::Load($reader)
  $window.ShowDialog() | Out-Null
} catch {
  # WebView2 不可用，用浏览器打开
  Write-Host "Falling back to browser..."
  Start-Process "http://localhost:3333"
}
