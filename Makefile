.PHONY: setup pipeline dashboard

setup:
	@echo "Installing Python dependencies..."
	pip install -r requirements.txt
	@echo "Installing Next.js dependencies..."
	npm install --legacy-peer-deps

pipeline:
	@echo "Step 1: Initializing database and loading raw data..."
	python load_data.py
	@echo "Step 2: Running statistical analysis and building summary tables..."
	python analysis.py
	@echo "Pipeline complete! Database is fully populated."

dashboard:
	@echo "Starting the Next.js dashboard server..."
	npm run dev