"""
Core5 Website - Python Server (Flask alternative to server.js)
Serves static files and optionally handles contact inquiries.
Run:
    python app.py
Or with gunicorn:
    gunicorn app:app
"""

import os
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder=".", static_url_path="")

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(".", path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=False)

