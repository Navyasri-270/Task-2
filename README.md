# Data Visualization & Business Storytelling: Superstore Sales Performance

An interactive business intelligence and executive storytelling portfolio project based on the classic **Sample Superstore** dataset. This project features a fully interactive web-based dashboard and a Tableau workbook that reveal operational insights, profit leakages, and seasonal trends to support executive decision-making.

---

## 📊 Live Interactive Dashboard
The interactive dashboard has been built as a portable web application that runs directly in the browser (without local CORS server requirements).
* **Launch:** Double-click on `Dashboard/index.html` to open the interactive dashboard.
* **Features:**
  * **Dynamic Slicers:** Filter all charts and KPI cards simultaneously by Region, Category, Segment, and Year.
  * **Interactive Tabs:** Swap between the live chart grid (**Dashboard**) and the executive story report (**Business Story**).
  * **Business Insights:** Dynamic context notes update automatically alongside the visualizations.

---

## 📂 Repository Structure

```text
Data-Visualization-Storytelling/
│
├── Dataset/
│   └── Superstore.csv            # Cleaned transactional database (9,994 records)
│
├── Dashboard/
│   ├── Dashboard.twb             # Tableau Workbook blueprint connected to Superstore.csv
│   ├── Dashboard.pdf             # Executive Report (PDF)
│   ├── index.html                # Main Dashboard User Interface
│   ├── styles.css                # Premium custom CSS styling
│   ├── app.js                    # Dynamic filter, metrics, and chart rendering logic
│   ├── data.js                   # Serialized dataset for browser compatibility
│   └── Screenshots/
│       ├── sales_trend.png
│       ├── sales_by_category.png
│       ├── profit_by_subcategory.png
│       ├── sales_by_segment.png
│       ├── sales_by_region.png
│       ├── sales_vs_profit.png
│       └── sales_by_state.png
│
├── scripts/
│   ├── download_data.py          # Script to fetch Superstore.csv from public sources
│   ├── process_data.py           # Pre-processes CSV and outputs clean JS/JSON records
│   └── generate_reports.py       # Script that generates static charts and compiles PDF report
│
├── Report.pdf                    # Executive Report (PDF)
└── README.md                     # Portfolio Documentation
```

---

## ⚙️ Tools & Technologies Used
* **Data Processing:** Python (Pandas)
* **Visualization Libraries:** Chart.js, Plotly.js, Matplotlib, Seaborn
* **Business Intelligence:** Tableau (TWB Workbook included)
* **UI/UX & Web Development:** HTML5, CSS3 (Custom Glassmorphism), Tailwind CSS, Vanilla JS
* **PDF Compilation:** ReportLab (Python)

---

## 🎯 Executive Dashboard Features
1. **Interactive KPI Cards:** Instantly track **Total Sales**, **Total Profit**, **Total Orders**, **Average Discount**, and **Operating Profit Margin**.
2. **Monthly Sales Trend (Line Chart):** Captures seasonal trends and sales/profit trajectories across a monthly timeline.
3. **Sales by Category (Bar Chart):** Compares total revenue against profitability for Technology, Office Supplies, and Furniture.
4. **Profitability by Sub-Category (Horizontal Bar Chart):** Identifies highly lucrative products versus items that drain profit.
5. **Interactive US State Map (Plotly Choropleth):** Visualizes geographic sales density across the United States.
6. **Customer Segment Treemap (Plotly Treemap):** Breaks down sales among Consumer, Corporate, and Home Office clients.
7. **Sales by Region (Donut Chart):** Shows market share across East, West, Central, and South regions.
8. **Sales vs. Profit Dynamics (Scatter Plot):** Highlights individual transactions to isolate outliers and trace profit trends relative to order sizes.

---

## 💡 Key Business Insights

### 1. Technology Leads Sales & Profits
* **Insight:** The **Technology** category generates the highest sales ($836k) and the highest total profit ($145k), maintaining a leading **17.4% operating margin**.
* **Driver:** Strong performance is powered by highly profitable sub-categories like **Copiers** and **Phones**.

### 2. Furniture Margin Crisis
* **Insight:** Despite high sales ($742k, almost equal to Technology), **Furniture** yields only **$18.4k in profit** (a critical **2.5% margin**).
* **Driver:** Highly negative returns in **Tables (-$17.7k loss)** and **Bookcases (-$3.4k loss)** due to excessive promotional discounting.

### 3. Geographical Performance
* **Insight:** The **West region** is the most profitable market, generating **$108k in profit** on **15.1% margin**.
* **Contrast:** The **Central region** is the least profitable (**7.9% margin**) due to hyper-competitive pricing behaviors in states like Texas.

### 4. The Risk of Discounting
* **Insight:** Transactions with discounts **under 15%** maintain healthy margins. However, discounts **above 20%** consistently generate operating losses across all categories.

### 5. Strong Holiday Seasonality
* **Insight:** Sales show a regular seasonal spike in Q4, peaking in **November and December** due to holiday retail demand.

---

## 📈 Strategic Recommendations
1. **Establish Discount Caps:** Cap promotional discounts on Furniture (specifically Tables and Bookcases) at **15%**. Restrict sales representatives from exceeding this threshold without director approval.
2. **Pivot Capital Allocation:** Reallocate marketing budgets and inventory buffers away from Furniture and towards high-margin sub-categories in **Technology** (Accessories, Copiers, Phones) and **Office Supplies** (Paper, Binders).
3. **Logistics Restructuring:** Perform an operational carrier review in the Central region to reduce shipping overhead.
4. **Q4 Seasonality Readiness:** Increase inventory stocking levels in late Q3 and secure freight capacity by early October to leverage the holiday demand spike without facing premium shipping costs.

---

## 📜 Conclusion
Through rigorous data visualization and storytelling, this project demonstrates that **revenue alone is not a sufficient indicator of business health**. By correcting structural discounting errors in Furniture, reallocating capital to Technology, and optimization of regional logistics, Superstore can successfully expand its overall profit margins from **12.47% to a target of 16.5%**.
