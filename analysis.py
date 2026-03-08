import sqlite3
import pandas as pd
import scipy.stats as stats
import seaborn as sns
import matplotlib.pyplot as plt
import os
import logging

# 1. Initialize the logger to append to your existing file
logging.basicConfig(
    filename='logger.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logging.info("Starting data analysis and summary generation.")

try:
    conn = sqlite3.connect('cell_counts.db')

    query = """
        SELECT 
            samples.sample_id, 
            subjects.condition, 
            samples.sample_type,
            subjects.treatment, 
            subjects.response,
            samples.b_cell,
            samples.cd8_t_cell, 
            samples.cd4_t_cell,
            samples.nk_cell,
            samples.monocyte
        FROM samples
        JOIN subjects ON samples.subject_id = subjects.subject_id
    """
    df = pd.read_sql_query(query, conn)
    conn.close()
    logging.info(f"Successfully loaded {len(df)} joined sample records from database.")

    populations = ['b_cell', 'cd8_t_cell', 'cd4_t_cell', 'nk_cell', 'monocyte']

    logging.info("Part 2: Data Overview")
    df['total_count'] = df[populations].sum(axis=1)

    summary_table = df.melt(
        id_vars=['sample_id', 'total_count', 'condition', 'sample_type', 'treatment', 'response'], 
        value_vars=populations, 
        var_name='population', 
        value_name='count'
    )

    summary_table['percentage'] = (summary_table['count'] / summary_table['total_count']) * 100
    
    print(summary_table[['sample_id', 'total_count', 'population', 'count', 'percentage']].head(10))

    logging.info("Part 3: Statistical Analysis")
    cohort = summary_table[
        (summary_table['condition'].str.lower() == 'melanoma') &
        (summary_table['treatment'].str.lower() == 'miraclib') &
        (summary_table['sample_type'].str.upper() == 'PBMC')
    ]

    # Run t-tests and save to df
    stats_data = []
    logging.info("Running independent T-Tests (Responders vs Non-Responders)...")
    for pop in populations:
        yes_group = cohort[(cohort['population'] == pop) & (cohort['response'].str.lower() == 'yes')]['percentage']
        no_group = cohort[(cohort['population'] == pop) & (cohort['response'].str.lower() == 'no')]['percentage']
        
        t_stat, p_val = stats.ttest_ind(yes_group, no_group, equal_var=False, nan_policy='omit')
        is_sig = "YES" if p_val < 0.05 else "NO"
        
        stats_data.append({
            'population': pop,
            'p_value': p_val,
            'is_significant': is_sig
        })
        # Log the specific findings for each cell type
        logging.info(f"T-Test - {pop}: p-value = {p_val:.4f} | Significant? {is_sig}")

    # Save stats/summary to sqlite
    logging.info("Writing results to SQLite database...")
    conn = sqlite3.connect('cell_counts.db')
    stats_df = pd.DataFrame(stats_data)
    stats_df.to_sql('ttest_results', conn, if_exists='replace', index=False)
    summary_table.to_sql('population_summary', conn, if_exists='replace', index=True, index_label='id')
    conn.close()
    logging.info("Successfully updated 'population_summary' and 'ttest_results' tables.")

    # Plot to seaborn
    logging.info("Generating seaborn boxplot...")
    plt.figure(figsize=(10, 6))
    sns.boxplot(
        data=cohort, 
        x='population', 
        y='percentage', 
        hue='response',
        palette={'yes': '#3b82f6', 'no': '#ef4444'} 
    )

    plt.title("Relative Frequency of Cell Populations by Response (Melanoma / Miraclib / PBMC)")
    plt.ylabel("Relative Frequency (%)")
    plt.xlabel("Immune Cell Population")
    plt.legend(title="Response")
    plt.tight_layout()

    os.makedirs('public', exist_ok=True)

    plt.savefig('public/boxplot.png', dpi=300, bbox_inches='tight')
    logging.info("Successfully saved boxplot image to public/seaborn_boxplot.png.")
    
    logging.info("Part 4: Data Subset Analysis")

    conn = sqlite3.connect('cell_counts.db')
    query_part4 = """
        SELECT 
            samples.sample_id,
            subjects.subject_id,
            subjects.project_id,
            subjects.response,
            subjects.sex
        FROM samples
        JOIN subjects ON samples.subject_id = subjects.subject_id
        WHERE LOWER(subjects.condition) = 'melanoma'
          AND UPPER(samples.sample_type) = 'PBMC'
          AND LOWER(subjects.treatment) = 'miraclib'
          AND samples.time_from_treatment_start = 0
    """
    baseline_df = pd.read_sql_query(query_part4, conn)
    conn.close()

    logging.info(f"Retrieved {len(baseline_df)} baseline samples for the requested cohort.")
    print(f"Total baseline samples found: {len(baseline_df)}\n")

    print("Samples per Project:")
    project_counts = baseline_df['project_id'].value_counts()
    for proj, count in project_counts.items():
        print(f"  - {proj}: {count}")
    
    unique_subjects = baseline_df.drop_duplicates(subset=['subject_id'])

    print("\nSubjects by Response:")
    response_counts = unique_subjects['response'].str.lower().value_counts()
    for resp, count in response_counts.items():
        print(f"  - {resp.capitalize()}: {count}")

    print("\nSubjects by Sex:")
    sex_counts = unique_subjects['sex'].str.lower().value_counts()
    for sex, count in sex_counts.items():
        print(f"  - {sex.capitalize()}: {count}")
    
    logging.info("Completed Part 4 Data Subset Analysis.")
    
    logging.info("")
    query_b_cells = """
        SELECT ROUND(AVG(samples.b_cell), 2)
        FROM samples
        JOIN subjects ON samples.subject_id = subjects.subject_id
        WHERE LOWER(subjects.condition) = 'melanoma'
          AND UPPER(subjects.sex) = 'M'
          AND samples.time_from_treatment_start = 0
    """
    
    conn = sqlite3.connect('cell_counts.db')
    cursor = conn.cursor()
    cursor.execute(query_b_cells)
    
    avg_b_cells = cursor.fetchone()[0]
    conn.close()
    
    print(f"\nAverage B cells for Melanoma male responders at time=0: {avg_b_cells:.2f}")
    logging.info(f"Calculated average B cells for target cohort: {avg_b_cells:.2f}")

    print("\nAnalysis complete! Check logger.log for detailed output.")

except Exception as e:
    logging.error(f"Analysis script failed: {str(e)}")
    print(f"\nError: {str(e)}")