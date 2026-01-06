@echo off
echo ==========================================
echo    AutoCare - GitHub Deployment Helper (Force Mode)
echo ==========================================
echo.
echo Este script vai FORÇAR o envio do seu codigo para o GitHub.
echo ATENCAO: Isso vai substituir qualquer arquivo que estiver la no GitHub.
echo.

:: Verifica se o Git esta instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Git nao encontrado! Verifique se instalou corretamente e reabra este terminal.
    pause
    exit /b
)

echo 1. Inicializando (Re-inicializando) repositorio...
rmdir /s /q .git >nul 2>&1
git init

echo 2. Configurando usuario Git local...
git config user.email "deploy@autocare.local"
git config user.name "AutoCare Deployer"

echo.
echo 3. Adicionando arquivos...
git add .

echo.
echo 4. Criando commit...
git commit -m "Autocare Deployment: Force Push"

echo.
echo 4. Configurando remoto...
git branch -M main
set REPO_URL=https://github.com/grampinelli1985-eng/AutocareV2.git
git remote add origin %REPO_URL%

echo.
echo 5. Testando conexao com o GitHub...
git remote show origin
if %errorlevel% neq 0 (
    echo ERRO: Nao foi possivel conectar ao repositorio.
    echo Verifique se a URL esta correta e se voce tem permissao.
    pause
    exit /b
)

echo.
echo 6. FORÇANDO envio para o GitHub...
echo Uma janela de login pode aparecer. Fique atento!
git push -u origin main --force

if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo ERRO AO ENVIAR CODIGO!
    echo O Git nao conseguiu enviar os arquivos.
    echo Verifique a mensagem de erro vermelha acima.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
) else (
    echo.
    echo ==========================================
    echo SUCESSO! Codigo enviado com sucesso.
    echo ==========================================
)
pause
