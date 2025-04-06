.PHONY: venv install run webrun freeze clean

PYTHON_VERSION := python3.11
VENV_DIR := .venv
PYTHON := $(VENV_DIR)/bin/python
PIP := $(VENV_DIR)/bin/pip

venv:
	$(PYTHON_VERSION) -m venv $(VENV_DIR)

install: venv
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

run: install
	$(PYTHON) main.py

webrun: install
	$(PYTHON) live.py

freeze:
	$(PIP) freeze > requirements.txt

clean:
	rm -rf $(VENV_DIR)
