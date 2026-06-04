# AgentScope 桌面启动器
# 使用 Windows 原生 WebView2，零依赖运行

param(
  [switch]$Dev,
  [switch]$NoServer
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 确保 Vite 开发服务器在运行
if (-not $NoServer) {
  $vite = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
  if (-not $vite -or $Dev) {
    $viteDir = if ($Dev) { $AppDir } else { $AppDir }
    Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "vite --port 3333" -WorkingDirectory $viteDir
    Start-Sleep 2
  }
}

$url = if ($Dev) { "http://localhost:3333" } else { "file:///$($AppDir.Replace('\','/'))/dist/index.html" }

# 创建 WPF WebView2 窗口
Add-Type -AssemblyName PresentationCore, PresentationFramework, WindowsBase

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="AgentScope · 观星台"
        Width="1200" Height="800" WindowStartupLocation="CenterScreen"
        Background="#0a0a0f">
  <Grid>
    <WebView2 x:Name="web" Source="$url" />
  </Grid>
</Window>
"@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]($xaml))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

# 确保 WebView2 可用
try {
  $window.web.EnsureCoreWebView2Async().Wait()
  $window.web.CoreWebView2.Settings.AreDevToolsEnabled = $false
  $window.web.CoreWebView2.Settings.IsStatusBarEnabled = $false
} catch {
  # WebView2 可能没装，fallback 到浏览器
  Start-Process $url
  Write-Warning "WebView2 未安装，已用浏览器打开。"
  return
}

$window.Closed.Add({
  # 关闭时停止 Vite
  Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" } | Stop-Process -Force
})

[System.Windows.Application]::new().Run($window)
