#Requires -Version 7.4
[CmdletBinding()]
param(
    [ValidateSet('07b-seo-mobile', '08-ux-mobile', '09-audit', '09-fixes', '10-recette', '11-release')]
    [string]$From = '07b-seo-mobile',
    [ValidateSet('07b-seo-mobile', '08-ux-mobile', '09-audit', '09-fixes', '10-recette', '11-release')]
    [string]$To = '11-release',
    [string]$CodexPath,
    [string]$NodePath,
    [string]$NpmPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
# Native stderr is not a failure by itself: the actual exit code is checked below.
$PSNativeCommandUseErrorActionPreference = $false
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$steps = @('07b-seo-mobile', '08-ux-mobile', '09-audit', '09-fixes', '10-recette', '11-release')
$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$promptDirectory = Join-Path $repositoryRoot 'docs/codex'
$script:AgentResponse = $null
$script:AgentFailed = $false
$currentStep = 'initialisation'
$runDirectory = $null
$originalPath = $env:PATH

function Resolve-NodeExecutable {
    if (-not [string]::IsNullOrWhiteSpace($NodePath)) {
        $explicit = Get-Command -Name $NodePath -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $explicit) { throw 'Chemin -NodePath invalide.' }
        return $explicit.Source
    }
    $command = Get-Command node -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $command) { return $command.Source }
    $candidates = @()
    if ($env:ProgramFiles) { $candidates += Join-Path $env:ProgramFiles 'nodejs/node.exe' }
    if ($env:USERPROFILE) { $candidates += Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
    foreach ($candidate in $candidates) { if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $candidate } }
    throw 'Node.js introuvable. Installer Node.js 24 LTS ou fournir -NodePath.'
}

function Resolve-NpmExecutable {
    if (-not [string]::IsNullOrWhiteSpace($NpmPath)) {
        $explicit = Get-Command -Name $NpmPath -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $explicit) { throw 'Chemin -NpmPath invalide.' }
        return $explicit.Source
    }
    $command = Get-Command npm -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $command) { return $command.Source }
    $localNpm = Join-Path $repositoryRoot 'node_modules/.bin/npm.cmd'
    if (Test-Path -LiteralPath $localNpm -PathType Leaf) { return $localNpm }
    $sibling = Join-Path (Split-Path -Parent $node) 'npm.cmd'
    if (Test-Path -LiteralPath $sibling -PathType Leaf) { return $sibling }
    throw 'npm introuvable. Réinstaller les dépendances du projet (npm local inclus) ou fournir -NpmPath.'
}

function Resolve-CodexExecutable {
    if (-not [string]::IsNullOrWhiteSpace($CodexPath)) {
        $explicit = Get-Command -Name $CodexPath -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $explicit) { throw 'Le chemin fourni dans -CodexPath ne désigne pas un exécutable disponible.' }
        return $explicit.Source
    }
    $command = Get-Command codex -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $command) { return $command.Source }
    # Desktop ships a CLI in a versioned directory which may not be in terminal PATH.
    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $desktopBin = Join-Path $env:LOCALAPPDATA 'OpenAI/Codex/bin'
        if (Test-Path -LiteralPath $desktopBin -PathType Container) {
            $candidates = @(Get-ChildItem -LiteralPath $desktopBin -Directory | ForEach-Object {
                $executable = Join-Path $_.FullName 'codex.exe'
                if (Test-Path -LiteralPath $executable -PathType Leaf) { Get-Item -LiteralPath $executable }
            })
            $latest = $candidates | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
            if ($null -ne $latest) { return $latest.FullName }
        }
    }
    throw 'Codex introuvable. Ajouter Codex CLI au PATH ou fournir -CodexPath avec son chemin complet.'
}

function Assert-NoSecretFiles([string]$Directory) {
    # Inspect names only. Never open, delete, move or display a sensitive file.
    foreach ($entry in Get-ChildItem -LiteralPath $Directory -Force) {
        if ($entry.Name -in @('.git', 'node_modules', '.next', '.next-dev', 'out', 'logs', '.gradle', 'build')) { continue }
        if ($entry.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
            throw 'Lien de filesystem détecté hors des dossiers générés. Vérifier le checkout avant exécution.'
        }
        if ($entry.PSIsContainer) { Assert-NoSecretFiles $entry.FullName; continue }
        if ($entry.Name -ne '.env.example' -and $entry.Name -match '(?i)^(\.env(?:\..*)?|\.npmrc|auth\.json|credentials(?:\..*)?|id_rsa|id_ed25519|keystore\.properties|signing\.properties|.*\.(?:pem|key|p12|pfx|jks|keystore)|service-account.*\.json)$') {
            throw "Fichier potentiellement sensible détecté. Utiliser un checkout sans secrets ; aucun fichier n'a été lu ou déplacé."
        }
    }
}

function Protect-Output([string]$Text) {
    # Defense in depth: never print known credential formats or assignment values.
    $Text = [regex]::Replace($Text, '(?i)\b(?:sk-[a-z0-9_-]{12,}|gh[pousr]_[a-z0-9_]{12,}|github_pat_[a-z0-9_]{12,}|AKIA[A-Z0-9]{16})\b', '[REDACTED]')
    $Text = [regex]::Replace($Text, '(?i)(Bearer\s+)[a-z0-9._~+/-]+', '$1[REDACTED]')
    $Text = [regex]::Replace($Text, '(?i)((?:api[_-]?key|access[_-]?token|refresh[_-]?token|password|secret|storePassword|keyPassword)\s*["'']?\s*[:=]\s*)(?:"[^"\r\n]*"|''[^''\r\n]*''|[^\s,}\r\n]+)', '$1[REDACTED]')
    return [regex]::Replace($Text, '(https?://)[^/\s:@]+:[^/\s@]+@', '$1[REDACTED]@')
}

function Write-CommandLine([object]$Line, [string]$LogPath, [bool]$ParseCodex) {
    $text = [string]$Line
    if ($ParseCodex) {
        try {
            $event = $text | ConvertFrom-Json -ErrorAction Stop
            if ($event.type -eq 'turn.failed' -or $event.type -eq 'error') { $script:AgentFailed = $true }
            if ($event.type -eq 'item.completed' -and $event.item.type -eq 'agent_message') {
                $script:AgentResponse = $event.item.text
            }
        } catch { # Non-JSON stderr is logged but is not automatically a failure.
        }
    }
    $safe = Protect-Output $text
    Add-Content -LiteralPath $LogPath -Value $safe -Encoding utf8
    # Codex tool output stays in the log; terminal output is limited to progress.
    if (-not $ParseCodex) { Write-Host $safe }
}

function Invoke-LoggedCommand {
    param([string]$Executable, [string[]]$Arguments, [string]$LogPath, [string]$InputText, [switch]$CodexEvents)
    $global:LASTEXITCODE = 0
    if ($CodexEvents) {
        $InputText | & $Executable @Arguments 2>&1 | ForEach-Object { Write-CommandLine $_ $LogPath $true }
    } else {
        & $Executable @Arguments 2>&1 | ForEach-Object { Write-CommandLine $_ $LogPath $false }
    }
    $code = $LASTEXITCODE
    Add-Content -LiteralPath $LogPath -Value "EXIT_CODE=$code" -Encoding utf8
    if ($code -ne 0) { throw "Commande échouée (code $code). Voir le journal correspondant." }
}

function Stop-ForManualValidation([string[]]$Checklist, [int]$StepIndex) {
    Write-Host "`nMANUAL VALIDATION REQUIRED" -ForegroundColor Yellow
    foreach ($item in $Checklist) { Write-Host ("[ ] " + (Protect-Output $item)) }
    $manualFile = Join-Path $runDirectory "$currentStep.manual.md"
    $lines = @('# MANUAL VALIDATION REQUIRED', '', "Étape : $currentStep", '')
    $lines += $Checklist | ForEach-Object { '- [ ] ' + (Protect-Output $_) }
    if ($StepIndex -lt ($steps.Count - 1)) {
        $next = $steps[$StepIndex + 1]
        Write-Host "Après validation humaine : ./scripts/run-codex-pipeline.ps1 -From `"$next`""
        $lines += @('', "Après validation humaine, reprendre avec -From $next.")
    } else { Write-Host 'Dernière étape atteinte. Toute publication reste une action humaine distincte.' }
    Set-Content -LiteralPath $manualFile -Value $lines -Encoding utf8
}

$exitCode = 1
Push-Location -LiteralPath $repositoryRoot
try {
    Assert-NoSecretFiles $repositoryRoot
    $first = [array]::IndexOf($steps, $From)
    $last = [array]::IndexOf($steps, $To)
    if ($first -gt $last) { throw '-From doit précéder ou être égal à -To.' }
    $selected = @($steps[$first..$last])
    # Preflight the entire selected range; never silently skip a missing prompt.
    foreach ($step in $selected) {
        $file = Join-Path $promptDirectory "$step.md"
        if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Prompt manquant : docs/codex/$step.md" }
        if ([string]::IsNullOrWhiteSpace([System.IO.File]::ReadAllText($file))) { throw "Prompt vide : docs/codex/$step.md" }
    }
    $schemaFile = Join-Path $promptDirectory 'response-schema.json'
    $manualGates = Get-Content -LiteralPath (Join-Path $promptDirectory 'manual-checklists.json') -Raw | ConvertFrom-Json -AsHashtable
    if (-not (Test-Path -LiteralPath $schemaFile -PathType Leaf)) { throw 'Schéma de réponse absent.' }
    foreach ($key in $manualGates.Keys) {
        if ($key -notin $steps -or $manualGates[$key].Count -eq 0) { throw 'Configuration des checklists manuelles invalide.' }
    }
    $codex = Resolve-CodexExecutable
    $node = Resolve-NodeExecutable
    # Only this process and its children receive the tool directories; no persistent PATH edit.
    $env:PATH = (Split-Path -Parent $node) + [System.IO.Path]::PathSeparator + $originalPath
    $npm = Resolve-NpmExecutable
    $env:PATH = (Split-Path -Parent $npm) + [System.IO.Path]::PathSeparator + $env:PATH
    $nodeVersion = & $node --version
    if ($LASTEXITCODE -ne 0 -or [version]($nodeVersion.Trim().TrimStart('v')) -lt [version]'22.18.0') { throw 'Node.js 22.18 minimum requis ; Node.js 24 recommandé.' }
    $package = Get-Content -LiteralPath (Join-Path $repositoryRoot 'package.json') -Raw | ConvertFrom-Json -AsHashtable
    $expectedChecks = @{}
    foreach ($check in @('test', 'lint', 'build')) {
        if (-not $package.scripts.ContainsKey($check)) { throw "Script npm $check absent." }
        $expectedChecks[$check] = $package.scripts[$check]
    }
    $runId = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
    $runDirectory = Join-Path $repositoryRoot "logs/codex/$runId"
    New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null
    Write-Host "FretLab : $From -> $To | Journaux : logs/codex/$runId" -ForegroundColor Cyan
    for ($index = $first; $index -le $last; $index++) {
        $currentStep = $steps[$index]
        Write-Host "`n[$($index - $first + 1)/$($selected.Count)] $currentStep — Codex" -ForegroundColor Cyan
        $instructions = [System.IO.File]::ReadAllText((Join-Path $promptDirectory "$currentStep.md"))
        $policy = @'
Tu exécutes une phase locale de FretLab. Les règles suivantes priment sur le fichier de phase.
Ne publie, ne déploie, ne soumets rien. Ne pousse jamais vers Git, ne crée pas de PR ni de message externe.
Ne supprime jamais le repository, ses dossiers racines ou .git ; aucun nettoyage récursif, reset --hard ou clean Git.
Ne lis, ne modifie et n’affiche aucun secret : .env (sauf .env.example sans valeurs privées), auth.json, credentials,
keystores, clés privées, tokens, mots de passe, fichiers de signature ou contenu des variables d’environnement.
Ne contourne jamais le sandbox et ne demande aucune élévation. N’utilise aucun outil externe ou service de publication.
Conserve les modifications existantes. Ne modifie pas le pipeline, ses règles, checklists ou schémas pour contourner un arrêt.
11-release autorise uniquement du code ou de la documentation locale sans secrets, sans signature et sans publication.
Ne simule jamais un test sur vrai smartphone. Si un tel test est nécessaire, réalise uniquement le travail local autorisé
puis retourne status=manual_validation_required avec une checklist concrète. Ne déclare pas ce test réussi.
Retourne le JSON demandé : completed seulement si le travail automatisable est fini, blocked ou failed sinon.
Ne masque pas un échec. La commande appelante lancera ensuite npm run test, npm run lint et npm run build.
'@
        $script:AgentResponse = $null
        $script:AgentFailed = $false
        $arguments = @('--ask-for-approval', 'never', 'exec', '--sandbox', 'workspace-write',
            '--ignore-user-config', '--ephemeral', '--color', 'never', '--json',
            '-c', 'sandbox_workspace_write.network_access=false',
            '-c', 'shell_environment_policy.inherit="core"',
            '-c', 'shell_environment_policy.include_only=["PATH","SystemRoot","WINDIR","TEMP","TMP","ComSpec","PATHEXT"]',
            '--cd', $repositoryRoot, '--output-schema', $schemaFile, '-')
        Invoke-LoggedCommand -Executable $codex -Arguments $arguments -InputText "$policy`n`nPHASE : $currentStep`n$instructions" -CodexEvents -LogPath (Join-Path $runDirectory "$currentStep.codex.jsonl")
        if ($script:AgentFailed -or [string]::IsNullOrWhiteSpace($script:AgentResponse)) { throw 'Codex a échoué ou ne fournit pas de résultat exploitable.' }
        $result = $script:AgentResponse | ConvertFrom-Json -AsHashtable
        if ($result.status -notin @('completed', 'manual_validation_required')) { throw 'Codex signale un blocage ou un échec.' }
        if ($result.summary -isnot [string] -or $result.manualChecklist -isnot [array]) { throw 'Réponse Codex invalide.' }
        foreach ($item in $result.manualChecklist) { if ($item -isnot [string] -or [string]::IsNullOrWhiteSpace($item)) { throw 'Checklist Codex invalide.' } }
        $result.summary = Protect-Output $result.summary
        $result.manualChecklist = @($result.manualChecklist | ForEach-Object { Protect-Output $_ })
        Set-Content -LiteralPath (Join-Path $runDirectory "$currentStep.result.json") -Value ($result | ConvertTo-Json -Depth 8) -Encoding utf8
        Write-Host (Protect-Output $result.summary)
        Assert-NoSecretFiles $repositoryRoot
        $package = Get-Content -LiteralPath (Join-Path $repositoryRoot 'package.json') -Raw | ConvertFrom-Json -AsHashtable
        foreach ($check in @('test', 'lint', 'build')) {
            if ($package.scripts[$check] -ne $expectedChecks[$check]) { throw "Commande npm $check modifiée par la phase. Relire cette modification avant une nouvelle exécution." }
            Write-Host "[$currentStep] npm run $check" -ForegroundColor Cyan
            Invoke-LoggedCommand -Executable $npm -Arguments @('--ignore-scripts', 'run', $check) -LogPath (Join-Path $runDirectory "$currentStep.$check.log")
        }
        $checklist = @()
        if ($manualGates.ContainsKey($currentStep)) { $checklist += $manualGates[$currentStep] }
        $checklist += $result.manualChecklist
        if ($result.status -eq 'manual_validation_required' -and $checklist.Count -eq 0) { throw 'Codex demande une validation humaine sans checklist.' }
        if ($checklist.Count -gt 0) {
            Stop-ForManualValidation -Checklist @($checklist | Select-Object -Unique) -StepIndex $index
            $exitCode = 2
            break
        }
        Write-Host "[$currentStep] TERMINÉ — contrôles réussis" -ForegroundColor Green
        $exitCode = 0
    }
    if ($exitCode -eq 0) { Write-Host "`nPlage sélectionnée terminée. Aucune publication ni push." -ForegroundColor Green }
} catch {
    $exitCode = 1
    Write-Host "`nARRÊT — $currentStep : $(Protect-Output $_.Exception.Message)" -ForegroundColor Red
} finally { $env:PATH = $originalPath; Pop-Location }
exit $exitCode
