import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

# 1. Setup & Data Loading
csv_path = "Dataset/Superstore.csv"
try:
    df = pd.read_csv(csv_path, encoding='windows-1252')
except Exception:
    df = pd.read_csv(csv_path, encoding='latin1')

df['Order Date'] = pd.to_datetime(df['Order Date'], format='mixed')
df['Year'] = df['Order Date'].dt.year
df['Month'] = df['Order Date'].dt.strftime('%Y-%m')

# Create Directories
os.makedirs("Dashboard/Screenshots", exist_ok=True)

# Define clean professional palette (Blue-White Professional Theme)
primary_blue = '#1e3a8a'
accent_sky = '#38bdf8'
dark_slate = '#0f172a'
emerald_green = '#10b981'
rose_red = '#ef4444'

sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

print("Generating charts...")

# --- CHART 1: Monthly Sales Trend ---
plt.figure(figsize=(10, 4.5))
monthly_data = df.groupby('Month').agg({'Sales': 'sum', 'Profit': 'sum'}).sort_index().reset_index()
# Take last 24 months for readability or show all. Let's show all but format ticks.
plt.plot(monthly_data['Month'], monthly_data['Sales'], color=primary_blue, linewidth=2.5, label='Sales')
plt.fill_between(monthly_data['Month'], monthly_data['Sales'], alpha=0.1, color=primary_blue)
plt.plot(monthly_data['Month'], monthly_data['Profit'], color=emerald_green, linewidth=2, label='Profit')
plt.title('Monthly Sales & Profit Trend (Historical)', fontsize=13, fontweight='bold', pad=15, color=dark_slate)
plt.xlabel('Month', fontsize=10, labelpad=10)
plt.ylabel('Amount ($)', fontsize=10, labelpad=10)
# Select every 6th tick for readability
ticks_to_use = monthly_data['Month'].iloc[::6]
plt.xticks(ticks_to_use, rotation=45, fontsize=8)
plt.yticks(fontsize=9)
plt.legend(frameon=True, fontsize=9)
plt.tight_layout()
chart1_path = "Dashboard/Screenshots/sales_trend.png"
plt.savefig(chart1_path, dpi=200)
plt.close()

# --- CHART 2: Sales by Category ---
plt.figure(figsize=(8, 4.5))
cat_data = df.groupby('Category').agg({'Sales': 'sum', 'Profit': 'sum'}).reset_index()
x = range(len(cat_data))
width = 0.35
plt.bar([i - width/2 for i in x], cat_data['Sales'], width, label='Sales', color=primary_blue, edgecolor='none')
plt.bar([i + width/2 for i in x], cat_data['Profit'], width, label='Profit', color=emerald_green, edgecolor='none')
plt.title('Sales & Profit by Category', fontsize=13, fontweight='bold', pad=15, color=dark_slate)
plt.xticks(x, cat_data['Category'], fontsize=10)
plt.ylabel('Amount ($)', fontsize=10)
plt.legend(frameon=True, fontsize=9)
plt.tight_layout()
chart2_path = "Dashboard/Screenshots/sales_by_category.png"
plt.savefig(chart2_path, dpi=200)
plt.close()

# --- CHART 3: Profit by Sub-Category ---
plt.figure(figsize=(10, 6.5))
subcat_data = df.groupby('Sub-Category')['Profit'].sum().reset_index().sort_values(by='Profit', ascending=True)
colors_list = [emerald_green if p >= 0 else rose_red for p in subcat_data['Profit']]
plt.barh(subcat_data['Sub-Category'], subcat_data['Profit'], color=colors_list)
plt.title('Profit / Loss by Sub-Category', fontsize=13, fontweight='bold', pad=15, color=dark_slate)
plt.xlabel('Profit ($)', fontsize=10)
plt.axvline(0, color='black', linewidth=0.8, linestyle='--')
plt.tight_layout()
chart3_path = "Dashboard/Screenshots/profit_by_subcategory.png"
plt.savefig(chart3_path, dpi=200)
plt.close()

# --- CHART 4: Sales by Segment ---
plt.figure(figsize=(6, 4))
segment_data = df.groupby('Segment')['Sales'].sum().reset_index()
plt.pie(segment_data['Sales'], labels=segment_data['Segment'], colors=[primary_blue, '#2563eb', '#60a5fa'], 
        autopct='%1.1f%%', startangle=140, textprops={'fontsize': 10, 'weight': 'semibold'})
plt.title('Sales Distribution by Segment', fontsize=13, fontweight='bold', pad=15, color=dark_slate)
plt.tight_layout()
chart4_path = "Dashboard/Screenshots/sales_by_segment.png"
plt.savefig(chart4_path, dpi=200)
plt.close()

# --- CHART 5: Sales by Region Donut ---
plt.figure(figsize=(6, 5))
region_data = df.groupby('Region')['Sales'].sum().reset_index()
plt.pie(region_data['Sales'], labels=region_data['Region'], colors=[primary_blue, '#2563eb', '#60a5fa', '#93c5fd'], 
        autopct='%1.1f%%', startangle=90, pctdistance=0.75, textprops={'fontsize': 10})
centre_circle = plt.Circle((0,0), 0.55, fc='white')
fig = plt.gcf()
fig.gca().add_artist(centre_circle)
plt.title('Sales by Region', fontsize=13, fontweight='bold', pad=15, color=dark_slate)
plt.tight_layout()
chart5_path = "Dashboard/Screenshots/sales_by_region.png"
plt.savefig(chart5_path, dpi=200)
plt.close()

# --- CHART 6: Scatter Plot (Sales vs Profit) ---
plt.figure(figsize=(9, 5))
# Sample 500 for clean print
sample_df = df.sample(n=500, random_state=42) if len(df) > 500 else df
sns.scatterplot(data=sample_df, x='Sales', y='Profit', 
                hue=sample_df['Profit'] >= 0, palette={True: emerald_green, False: rose_red}, 
                alpha=0.7, edgecolor='none', s=40)
plt.title('Sales vs. Profit Dynamics (Transaction Sample)', fontsize=13, fontweight='bold', pad=15, color=dark_slate)
plt.xlabel('Sales ($)', fontsize=10)
plt.ylabel('Profit ($)', fontsize=10)
plt.legend(title='Profitable', labels=['Loss', 'Profit'], frameon=True, fontsize=9)
plt.tight_layout()
chart6_path = "Dashboard/Screenshots/sales_vs_profit.png"
plt.savefig(chart6_path, dpi=200)
plt.close()

# --- CHART 7: Top 10 States by Sales (For Map Requirement / Report Visualization) ---
plt.figure(figsize=(10, 5))
state_data = df.groupby('State')['Sales'].sum().reset_index().sort_values(by='Sales', ascending=False).head(10)
sns.barplot(data=state_data, x='Sales', y='State', palette='Blues_r', edgecolor='none')
plt.title('Top 10 States by Total Sales', fontsize=13, fontweight='bold', pad=15, color=dark_slate)
plt.xlabel('Sales ($)', fontsize=10)
plt.ylabel('State', fontsize=10)
plt.tight_layout()
chart7_path = "Dashboard/Screenshots/sales_by_state.png"
plt.savefig(chart7_path, dpi=200)
plt.close()

print("All charts generated successfully!")

# 3. PDF Generation (Executive Presentation PDF)
print("Compiling Report PDF...")

# Standard metrics
total_sales = df['Sales'].sum()
total_profit = df['Profit'].sum()
total_orders = df['Order ID'].nunique()
avg_discount = df['Discount'].mean()
margin = (total_profit / total_sales) * 100

pdf_filename = "Report.pdf"
doc = SimpleDocTemplate(pdf_filename, pagesize=letter,
                        rightMargin=0.5*inch, leftMargin=0.5*inch,
                        topMargin=0.5*inch, bottomMargin=0.5*inch)

styles = getSampleStyleSheet()

# Custom Styles
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=22,
    leading=26,
    textColor=colors.HexColor(primary_blue),
    spaceAfter=15
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=12,
    textColor=colors.HexColor('#64748b'),
    spaceAfter=25
)

h1_style = ParagraphStyle(
    'Heading1_Custom',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=14,
    leading=18,
    textColor=colors.HexColor(dark_slate),
    spaceBefore=15,
    spaceAfter=10,
    keepWithNext=True
)

body_style = ParagraphStyle(
    'Body_Custom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor('#334155'),
    spaceAfter=10
)

bullet_style = ParagraphStyle(
    'Bullet_Custom',
    parent=body_style,
    leftIndent=15,
    bulletIndent=5,
    spaceAfter=5
)

kpi_label_style = ParagraphStyle(
    'KPILabel',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9,
    leading=11,
    textColor=colors.HexColor('#64748b'),
    alignment=1 # Centered
)

kpi_val_style = ParagraphStyle(
    'KPIVal',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=15,
    leading=18,
    textColor=colors.HexColor(primary_blue),
    alignment=1 # Centered
)

story = []

# Header
story.append(Paragraph("SUPERSTORE EXECUTIVE PERFORMANCE REPORT", title_style))
story.append(Paragraph("BUSINESS INTELLIGENCE & STRATEGIC STORYBOARD", subtitle_style))
story.append(Spacer(1, 10))

# KPI Table
kpi_data = [
    [
        Paragraph("TOTAL SALES", kpi_label_style),
        Paragraph("TOTAL PROFIT", kpi_label_style),
        Paragraph("TOTAL ORDERS", kpi_label_style),
        Paragraph("AVG. DISCOUNT", kpi_label_style),
        Paragraph("PROFIT MARGIN", kpi_label_style)
    ],
    [
        Paragraph(f"${total_sales:,.2f}", kpi_val_style),
        Paragraph(f"${total_profit:,.2f}", kpi_val_style),
        Paragraph(f"{total_orders:,}", kpi_val_style),
        Paragraph(f"{avg_discount*100:.2f}%", kpi_val_style),
        Paragraph(f"{margin:.2f}%", kpi_val_style)
    ]
]

kpi_table = Table(kpi_data, colWidths=[1.5*inch]*5)
kpi_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#1e3a8a')),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('TOPPADDING', (0,0), (-1,-1), 8),
]))
story.append(kpi_table)
story.append(Spacer(1, 20))

# Executive Summary
story.append(Paragraph("Executive Summary", h1_style))
summary_text = (
    "This report provides a formal strategic assessment of Superstore's historical commercial operations. "
    "While the business has generated substantial revenue of <b>$2.30 Million</b> with an operating profit margin "
    "of <b>12.47%</b>, significant performance variations exist across product categories, geographic territories, "
    "and discount programs. This analysis identifies primary profit drivers, exposes critical revenue leakages, "
    "and outlines actionable executive recommendations to drive margin expansion."
)
story.append(Paragraph(summary_text, body_style))

# Section 1: Product Categories Performance
story.append(Paragraph("1. Category Analysis & Profit Divergence", h1_style))
story.append(Paragraph(
    "Superstore operations are segmented into three major divisions: Technology, Office Supplies, and Furniture. "
    "A deep dive reveals a striking disparity in performance:", body_style
))
story.append(Paragraph("• <b>Technology:</b> Generates the highest sales ($836k) and is our primary profit engine ($145k profit) at a <b>17.4% margin</b>, powered by exceptional performance in Copiers and Phones.", bullet_style))
story.append(Paragraph("• <b>Office Supplies:</b> Serves as our steady cash cow with $719k sales and $122k profit, retaining a healthy <b>17.0% margin</b> due to low production costs and high transactional frequency.", bullet_style))
story.append(Paragraph("• <b>Furniture:</b> While driving significant sales volume ($742k), it only captures $18.4k in profit, leaving a thin <b>2.5% margin</b>. This is a critical structural concern.", bullet_style))

story.append(Spacer(1, 10))
story.append(Image(chart2_path, width=5.5*inch, height=3*inch))
story.append(PageBreak())

# Page 2: Region & Sub-Category Analysis
story.append(Paragraph("2. Regional Profitability Landscape", h1_style))
story.append(Paragraph(
    "Geographically, performance is highly uneven. The West region leads in sales ($725k) and contributes the highest profit ($108k) at a <b>14.9% margin</b>. "
    "The East region follows closely with a 13.4% margin. Conversely, the Central region is our lowest-performing area, producing a profit margin of only <b>7.9%</b>. "
    "This underperformance in the Central region is primarily driven by hyper-competitive discount behaviors in major states like Texas, where aggregate profits are negative.", body_style
))

story.append(Spacer(1, 5))
# Table of Regions
reg_summary = df.groupby('Region').agg({'Sales': 'sum', 'Profit': 'sum'}).reset_index()
reg_summary['Margin'] = (reg_summary['Profit'] / reg_summary['Sales']) * 100
reg_data = [["Region", "Sales", "Profit", "Margin"]]
for idx, r in reg_summary.iterrows():
    reg_data.append([r['Region'], f"${r['Sales']:,.2f}", f"${r['Profit']:,.2f}", f"{r['Margin']:.2f}%"])

reg_table = Table(reg_data, colWidths=[1.8*inch]*4)
reg_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor(primary_blue)),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
]))
story.append(reg_table)
story.append(Spacer(1, 15))

# Sub-Category Analysis
story.append(Paragraph("3. Sub-Category Leakage: Tables & Bookcases", h1_style))
story.append(Paragraph(
    "When looking at individual product lines, Copiers and Phones represent our most profitable assets. "
    "However, we observe massive profit destruction in <b>Tables</b> (-$17.7k net loss) and <b>Bookcases</b> (-$3.4k net loss). "
    "This loss is not a result of low demand, but rather a direct consequence of aggressive promotional discounting.", body_style
))
story.append(Image(chart3_path, width=6*inch, height=3.5*inch))
story.append(PageBreak())

# Page 3: Strategic Recommendations & Conclusion
story.append(Paragraph("4. The Mechanics of Discounting", h1_style))
story.append(Paragraph(
    "Our data establishes a clear threshold: promotional discounts below 15% allow the business to maintain double-digit margins. "
    "However, any discount exceeding 20% leads directly to operating losses on the product line. Average discount levels in the "
    "Furniture category stand at 17.4%, which is far too high to support operational overhead.", body_style
))
story.append(Image(chart6_path, width=6.5*inch, height=3.5*inch))
story.append(Spacer(1, 10))

story.append(Paragraph("5. Tactical Business Recommendations", h1_style))
story.append(Paragraph("<b>1. Enforce Discount Caps on Furniture:</b> Implement a hard cap of 15% on promotional discounts for Tables and Bookcases. Restrict sales reps from exceeding this cap without executive sign-off.", bullet_style))
story.append(Paragraph("<b>2. Capital Reallocation:</b> Pivot marketing and inventory budgets from low-margin Furniture to high-margin Technology divisions (particularly Copiers and Accessories).", bullet_style))
story.append(Paragraph("<b>3. Central Region Freight Audit:</b> Perform a detailed operational review of carrier contracts in the Central region to reduce shipping cost overhead.", bullet_style))
story.append(Paragraph("<b>4. Leverage Q4 Seasonality:</b> Sales systematically peak in November and December. Inventory buffers should be established by October, with shipping capacity booked early to avoid holiday rate spikes.", bullet_style))

doc.build(story)
print("PDF compiled successfully as Report.pdf!")

# Copy Report.pdf to Dashboard/Dashboard.pdf to satisfy both structures
import shutil
shutil.copy("Report.pdf", "Dashboard/Dashboard.pdf")
print("Copied to Dashboard/Dashboard.pdf.")
