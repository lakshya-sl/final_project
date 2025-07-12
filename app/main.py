# this is the python backend for linking the html pages 

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import FileResponse
app = FastAPI()

# Allow frontend JS to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve folders
app.mount("/before_login", StaticFiles(directory="before_login"), name="before_login")
app.mount("/login_page", StaticFiles(directory="login_page"), name="login_page")
app.mount("/after_login", StaticFiles(directory="after_login"), name="after_login")

# User model
class LoginData(BaseModel):
    email: str
    password: str

# In-memory user store
users = {
    "test@example.com": "pass123"
}

@app.get("/")
def home():
    return FileResponse("before_login/index.html")

@app.get("/login")
def login():
    return FileResponse("login_page/page.html")

@app.get("/dashboard")
def dashboard():
    return FileResponse("after_login/frontend/ui.html")  # Your actual UI path

# ✅ Login route
@app.post("/login")
async def login_user(data: LoginData):
    if users.get(data.email) == data.password:
        return JSONResponse(content={"success": True})
    return JSONResponse(content={"success": False}, status_code=401)

# ✅ Signup route
@app.post("/signup")
async def signup_user(data: LoginData):
    if data.email in users:
        return JSONResponse(content={"success": False, "message": "User already exists"}, status_code=400)

    users[data.email] = data.password
    return JSONResponse(content={"success": True, "message": "User created successfully"})
