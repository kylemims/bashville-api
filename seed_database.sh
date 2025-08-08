#!/bin/bash

rm db.sqlite3
rm -rf ./bashvilleapi/migrations
python3 manage.py migrate
python3 manage.py makemigrations bashvilleapi
python3 manage.py migrate bashvilleapi
python3 manage.py loaddata users
python3 manage.py loaddata tokens

