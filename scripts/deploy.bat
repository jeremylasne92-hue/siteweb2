@echo off
REM ============================================
REM ECHO — Script de déploiement complet
REM Usage: double-cliquer ou lancer depuis le terminal
REM ============================================

echo.
echo ========================================
echo    DEPLOIEMENT MOUVEMENT ECHO
echo ========================================
echo.

REM Vérifier qu'on est dans le bon dossier
cd /d "C:\Dev\Site web ECHO"

REM Étape 1 : Build frontend
echo [1/4] Build frontend...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Le build a echoue ! Corrige les erreurs avant de deployer.
    pause
    exit /b 1
)
cd ..
echo [1/4] Build OK
echo.

REM Étape 2 : Git add + commit + push
echo [2/4] Git push...
git add -A
set /p COMMIT_MSG="Message de commit (ou ENTER pour 'deploy: mise a jour'): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=deploy: mise a jour
git commit -m "%COMMIT_MSG%"
git push
if %ERRORLEVEL% NEQ 0 (
    echo ATTENTION: Git push a echoue. Verifie ta connexion.
    pause
    exit /b 1
)
echo [2/4] Git push OK (Render se met a jour automatiquement)
echo.

REM Étape 3 : Upload FTP vers OVH
echo [3/4] Upload FTP vers OVH...
echo Lancement de l'upload FTP...

REM Créer le script FTP temporaire
(
echo open ftp.cluster121.hosting.ovh.net
echo mouvemd
echo %FTP_PASSWORD%
echo binary
echo cd /www
echo lcd "C:\Dev\Site web ECHO\frontend\dist"
echo prompt off
echo mdelete assets/*
echo mdelete images/*
echo mput .htaccess
echo mput index.html
echo mput logo-echo-transparent.png
echo mput logo-echo.jpg
echo mput logo-mouvement.png
echo mput manifest.json
echo mput robots.txt
echo mput sitemap.xml
echo mput vite.svg
echo cd /www/assets
echo lcd "C:\Dev\Site web ECHO\frontend\dist\assets"
echo mput *
echo cd /www/images
echo lcd "C:\Dev\Site web ECHO\frontend\dist\images"
echo mput *
echo quit
) > "%TEMP%\ftp_upload.txt"

REM Vérifier si le mot de passe FTP est configuré
if "%FTP_PASSWORD%"=="" (
    echo.
    echo ATTENTION: Variable FTP_PASSWORD non configuree.
    echo Pour configurer, lance cette commande une fois:
    echo   setx FTP_PASSWORD "ton_mot_de_passe_ftp"
    echo.
    echo En attendant, ouvre FileZilla manuellement:
    echo   Hote: ftp.cluster121.hosting.ovh.net
    echo   Login: mouvemd
    echo   Local: C:\Dev\Site web ECHO\frontend\dist\
    echo   Serveur: /www/
    echo   Ctrl+A puis Televerser
    echo.
    pause
    exit /b 0
)

ftp -s:"%TEMP%\ftp_upload.txt"
del "%TEMP%\ftp_upload.txt"

echo [3/4] Upload FTP OK
echo.

REM Étape 4 : Résumé
echo [4/4] Deploiement termine !
echo.
echo ========================================
echo   RESUME
echo ========================================
echo   Frontend : https://mouvementecho.fr
echo   Backend  : https://api.mouvementecho.fr
echo   Render   : deploiement auto en cours
echo ========================================
echo.
echo Ouvre https://mouvementecho.fr pour verifier.
echo.
pause
