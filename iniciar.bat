@echo off
echo Iniciando Motor Inteligente da Reforma Tributaria...
echo.

echo [1/2] Iniciando Backend (FastAPI) na porta 8000...
start "TribEngine-Backend" cmd /c "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 5 /nobreak >nul

echo [2/2] Iniciando Frontend (Next.js) na porta 3000...
set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
start "TribEngine-Frontend" cmd /c "cd /d "%~dp0frontend" && npx next dev --port 3000"

echo.
echo ============================================================
echo  Motor Inteligente da Reforma Tributaria
echo  IBS | CBS | Imposto Seletivo | cClassTrib
echo ============================================================
echo.
echo  Backend:  http://localhost:8000
echo  Swagger:  http://localhost:8000/docs
echo  Frontend: http://localhost:3000
echo.
echo  Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:3000
