@echo off
setlocal

set "JDK17=C:\Program Files\Java\jdk-17"
if exist "%JDK17%" (
  set "JAVA_HOME=%JDK17%"
  set "PATH=%JAVA_HOME%\bin;%PATH%"
)

echo Using JAVA_HOME=%JAVA_HOME%

call gradlew.bat assembleDebug %*
if errorlevel 1 exit /b 1

endlocal
