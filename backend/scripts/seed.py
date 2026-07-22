import os
import sys
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from database import SessionLocal
from models import User, RoleEnum
from auth import get_password_hash

def seed():
    db = SessionLocal()
    try:
        admin_email = "admin@productgen.ai"
        user_email = "user@productgen.ai"
        
        # Check admin
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                password_hash=get_password_hash("admin123"),
                role=RoleEnum.admin,
                company_name="ProductGen Admin"
            )
            db.add(admin)
            print(f"Created admin: {admin_email}")
        else:
            print(f"Admin {admin_email} already exists.")
            
        # Check user
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            user = User(
                email=user_email,
                password_hash=get_password_hash("user123"),
                role=RoleEnum.user,
                company_name="Acme Corp"
            )
            db.add(user)
            print(f"Created user: {user_email}")
        else:
            print(f"User {user_email} already exists.")
            
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
