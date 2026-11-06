from fastapi import Request, HTTPException              
from dotenv import load_dotenv
import os
import jwt

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")    
ALGORITHM = "HS256"

def get_current_user_id(request: Request) -> int:
    

    token = request.cookies.get("access_token") 
    
    if not token:
        # Por ahora, si no hay cookie, retornamos 1 para que puedas seguir probando.
        # Cuando unas tu login real, cambia esto a: raise HTTPException(status_code=401, detail="No autenticado")
        return 0
    
    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
        
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")