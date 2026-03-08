# Teiko_Technical

# Clinical Trial Data Dashboard

## How to Run the Code

This project is fully automated via a Makefile to ensure a seamless setup and execution environment.

Initialize the Environment:
Installs all necessary Python dependencies (Pandas, SciPy, Seaborn) and Node.js packages (Next.js, React, TanStack Table).

```bash
make setup
```

Execute the Data Pipeline:
Runs the Python backend to build the SQLite database, load the raw CSV data, perform t-tests, calculate population frequencies, and generate boxplots.

```bash
make pipeline
```

Launch the Dashboard:
Starts the Next.js local development server to view the interactive tables and pre-computed analysis.
    
```bash
make dashboard
```

## Database Schema & Scalability

The database (cell_counts.db) is structured into three primary tables: projects, subjects, and samples.

Design Rationale:
The schema is normalized to third normal form to eliminate data redundancy and insertion/deletion anomalies. By ensuring that every non-key attribute is strictly dependent on the candidate key of its respective table, we strip out redundant functional dependencies.

Scalability:
Because of this normalized design, the system handles scaling effortlessly. It utilizes a hierarchical one-to-many (1:N) relationship:

- 1 Project → Many Subjects

- 1 Subject → Many Samples

If this clinical trial scales to hundreds of projects and hundreds of thousands of samples, we simply append new rows to the samples and subjects tables. The database will not suffer from data bloat because repetitive project or subject-level metadata is never duplicated on the individual sample rows.

## Code Structure & Architecture Overview

This application utilizes a decoupled Pre-Computation Architecture to maximize frontend performance.

- Python Backend (Data Pipeline):

    - load_data.py: Initializes the SQLite database schema and acts as the ETL loader for the raw CSVs.

    - analysis.py: Queries the database to calculate population percentages, performs SciPy T-Tests for statistical significance between responders and non-responders, and generates Seaborn .png visualizations. Crucially, it saves these mathematical results back into SQLite as summary tables (population_summary, ttest_results).

- Next.js Frontend (Dashboard):

    - ```app/``` folder: Contains the main page layouts, routing, and React components that construct the UI.

    - ```lib/db.tsx```: Centralized database utility. It establishes and exports a single better-sqlite3 connection instance, to ensure that database queries are handled efficiently and securely across the server components without establishing redundant connections.

    - Uses ```@tanstack/react-table``` for client-side pagination, filtering, and sorting without needing to hit the database for every user interaction.