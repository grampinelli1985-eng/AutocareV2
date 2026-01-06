@echo off
setlocal enabledelayedexpansion

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

:: Tenta inicializar apenas se necessario
if not exist .git (
    echo Inicializando repositorio...
    git init
    git branch -M main
    set /p REPO_URL="Digite a URL do repositorio GitHub: "
    git remote add origin !REPO_URL!
)

echo 1. Adicionando alteracoes...
git add .

echo.
echo 2. Criando commit de atualizacao...
set /p COMMIT_MSG="Digite uma mensagem para esta atualizacao: "
if "!COMMIT_MSG!"=="" set COMMIT_MSG="Atualizacao automatica AutoCare"
git commit -m "!COMMIT_MSG!"

echo.
echo 3. Enviando para o GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ERRO ao enviar! Tentando resolver divergencias comuns...
    git pull origin main --rebase
    git push origin main
)

if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo ERRO FATAL: Nao foi possivel enviar o codigo automaticamente.
    echo Verifique conflitos ou sua conexao.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
) else (
    echo.
    echo ==========================================
    echo SUCESSO! Codigo enviado com sucesso.
    echo A Vercel deve iniciar o deploy em breve.
    echo ==========================================
)
pause
