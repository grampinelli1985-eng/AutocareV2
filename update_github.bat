@echo off
echo ==========================================
echo    AutoCare - Update & Deploy Helper
echo ==========================================
echo.
echo Este script vai enviar suas ultimas alteracoes para o GitHub.
echo Isso vai disparar automaticamente um novo deploy na Vercel.
echo.

:: Verifica se o Git esta instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Git nao encontrado!
    pause
    exit /b
)

echo 1. Adicionando alteracoes...
git add .

echo.
echo 2. Criando commit de atualizacao...
set /p COMMIT_MSG="Digite uma mensagem para esta atualizacao (ex: Corrigindo bug): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG="Atualizacao automatica via script"
git commit -m "%COMMIT_MSG%"

echo.
echo 3. Enviando para o GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ERRO ao enviar! Verifique sua conexao ou se existem conflitos.
) else (
    echo.
    echo ==========================================
    echo SUCESSO! Codigo enviado.
    echo A Vercel deve iniciar o deploy em instantes.
    echo ==========================================
)
pause
