from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from typing import List, Dict, Optional

app = FastAPI()

#Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Load CSV data
df = pd.read_csv('padres_project_data.csv')

def clean_dataframe(df):
    df = df.replace([np.inf, -np.inf], None)
    df = df.replace({np.nan: None})

    for col in df.select_dtypes(include=['float64']).columns:
        df[col] = df[col].apply(lambda x: float(x) if pd.notnull(x) else None)

    return df

df = clean_dataframe(df)

#Return all data
@app.get("/data")
async def get_data():
    try:
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"Error: {e}")
        return {"error": "Failed to retrieve data"}

#Return list of column names
@app.get("/columns")
async def get_columns():
    return list(df.columns)

#Return filtered data based on column and value
@app.get("/data/filtered")
async def get_filtered_data(
    column: str = Query(None, description="Column to filter on"),
    value: str = Query(None, description="Value to filter for")
):
    if column and value:
        filtered_df = df[df[column].astype(str).str.contains(value, case=False)]
        return filtered_df.to_dict(orient="records")
    return df.to_dict(orient="records")