# api/index.py
import sys
from pathlib import Path

# Add the python/ directory to sys.path
root = Path(__file__).resolve().parent.parent
sys.path.append(str(root / "python"))

# Import your existing app from python/api.py
from api import app  # app comes from python/api.py
