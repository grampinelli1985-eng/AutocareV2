@echo off
echo ==========================================
echo    AutoCare - Android Build Helper
echo ==========================================
echo.
echo 1. Gerando versao de producao do site...
call npm run build

if %errorlevel% neq 0 (
    echo ERRO no Build Web! Verifique o codigo.
    pause
    exit /b
)

echo.
echo 2. Sincronizando com Android...
call npx cap sync android

if %errorlevel% neq 0 (
    echo ERRO no Sync! Verifique se uma pasta 'android' existe.
    pause
    exit /b
)

echo.
echo ==========================================
echo SUCESSO!
echo Agora abra o Android Studio e rode no emulador.
echo Comando sugerido: npx cap open android
echo ==========================================
echo.
pause
