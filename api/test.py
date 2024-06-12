import os
from sheet_processing import process_file
import pandas as pd


# Path to the tests folder
tests_folder = "/Users/omrinuri/projects/Smart-Spreadsheet/tests"

# Get a list of all files in the tests folder
files = os.listdir(tests_folder)

# Process each file in the tests folder
for file in files:
    # Construct the full path to the file
    file_path = os.path.join(tests_folder, file)

    tables = process_file(file_path)

    for index, table in enumerate(tables):
        df = pd.DataFrame(table)
        df.to_csv(f"{file}_{index}.csv", index=False)
