import sys
sys.path.append('d:/AI-projects/Product_info_management/backend')
from auth import create_access_token
import requests

token = create_access_token({'sub': 'jayesh@zuigo.ai'})
try:
    res = requests.get('http://127.0.0.1:8000/products/', headers={'Authorization': f'Bearer {token}'})
    print(res.status_code)
    print(res.text)
except Exception as e:
    print(e)
