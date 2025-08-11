#!/bin/bash

rm db.sqlite3
rm -rf ./bashvilleapi/migrations
python3 manage.py migrate
python3 manage.py makemigrations bashvilleapi
python3 manage.py migrate bashvilleapi
python3 manage.py loaddata users
python3 manage.py loaddata tokens
python3 manage.py loaddata color_palettes
python3 manage.py loaddata commands
python3 manage.py loaddata projects
python3 manage.py loaddata project_commands
