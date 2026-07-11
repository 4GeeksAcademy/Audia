#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

pip install pipenv

pipenv install --system --deploy

pipenv run upgrade
