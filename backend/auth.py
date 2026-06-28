from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    if request.email == "admin@route53clone.com" and request.password == "admin123":
        return {
            "token": "mock-jwt-token-12345",
            "user": {
                "email": "admin@route53clone.com",
                "name": "Admin User"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me")
def get_me():
    return {
        "email": "admin@route53clone.com",
        "name": "Admin User"
    }

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
