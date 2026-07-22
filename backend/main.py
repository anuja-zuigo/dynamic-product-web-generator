from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, products, images, ai, admin

app = FastAPI(title="ProductGen AI PIM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(images.router)
app.include_router(ai.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ProductGen AI PIM API"}
