import os
import json
import pandas as pd

# Load dataset
csv_path = "Dataset/Superstore.csv"
try:
    df = pd.read_csv(csv_path, encoding='windows-1252')
except Exception:
    df = pd.read_csv(csv_path, encoding='latin1')

# Ensure Date Columns are datetime
df['Order Date'] = pd.to_datetime(df['Order Date'], format='mixed')
df['Year'] = df['Order Date'].dt.year
df['Month'] = df['Order Date'].dt.strftime('%Y-%m')

# Convert necessary fields to float/int
df['Sales'] = df['Sales'].astype(float)
df['Profit'] = df['Profit'].astype(float)
df['Discount'] = df['Discount'].astype(float)

# 1. Total Metrics
total_sales = float(df['Sales'].sum())
total_profit = float(df['Profit'].sum())
total_orders = int(df['Order ID'].nunique())
avg_discount = float(df['Discount'].mean())

print(f"Total Sales: {total_sales}, Total Profit: {total_profit}, Total Orders: {total_orders}, Avg Discount: {avg_discount}")

# We will export a clean list of records with only necessary columns for the dynamic slicer frontend.
# To keep the JSON payload small but fully functional for dynamic filtering by Region, Category, Segment, and Year:
records = df[['Year', 'Month', 'Region', 'Category', 'Sub-Category', 'Segment', 'State', 'Sales', 'Profit', 'Discount', 'Order ID']].copy()
records['MonthName'] = df['Order Date'].dt.strftime('%b')
records['MonthNum'] = df['Order Date'].dt.month

# Convert to dict list
records_list = records.to_dict(orient='records')

# Write to JS file (to avoid CORS block on file:// protocol)
os.makedirs("Dashboard", exist_ok=True)
with open("Dashboard/data.js", "w") as f:
    f.write("const superstoreData = ")
    json.dump(records_list, f, default=str)
    f.write(";")

print("Data processing complete. Saved to Dashboard/data.js")
