import os
import urllib.request
import pandas as pd

# Define target paths
dataset_dir = "Dataset"
output_file = os.path.join(dataset_dir, "Superstore.csv")

# Create dataset directory if it doesn't exist
os.makedirs(dataset_dir, exist_ok=True)

# URL options for the Sample Superstore dataset
urls = [
    "https://raw.githubusercontent.com/praveen-kumar-maurya/Superstore-Sales-Dashboard-Power-BI/main/Sample%20-%20Superstore.csv",
    "https://raw.githubusercontent.com/sharmaroshan/Clustering-Linear-Regression-and-PCA/master/Superstore.csv",
    "https://raw.githubusercontent.com/tushar-soni08/Sample-Superstore-Dataset/main/Sample%20-%20Superstore.csv"
]

downloaded = False
for url in urls:
    try:
        print(f"Attempting to download from: {url}")
        # Use urllib to download
        urllib.request.urlretrieve(url, output_file)
        print("Download successful!")
        
        # Verify with pandas
        try:
            df = pd.read_csv(output_file, encoding='windows-1252')
        except Exception:
            df = pd.read_csv(output_file, encoding='latin1')
            
        print("Dataset loaded successfully!")
        print(f"Rows: {len(df)}, Columns: {len(df.columns)}")
        print("Columns found:", list(df.columns))
        downloaded = True
        break
    except Exception as e:
        print(f"Failed to download or parse from {url}. Error: {e}")

if not downloaded:
    print("Could not download the dataset from any of the URLs.")
    exit(1)
