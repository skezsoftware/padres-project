from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from .routes import pitcher_stats, teams
from .database import db

app = FastAPI()

#Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(pitcher_stats.router, prefix="/api/v1")
app.include_router(teams.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the Padres Pitching Stats API"}

# Keep your existing data endpoints if needed
@app.get("/data")
async def get_data():
    try:
        return db.get_dataframe().to_dict(orient="records")
    except Exception as e:
        print(f"Error: {e}")
        return {"error": "Failed to retrieve data"}

@app.get("/columns")
async def get_columns():
    return list(db.get_dataframe().columns)

@app.get("/data/filtered")
async def get_filtered_data(
    column: str = Query(None, description="Column to filter on"),
    value: str = Query(None, description="Value to filter for")
):
    df = db.get_dataframe()
    if column and value:
        filtered_df = df[df[column].astype(str).str.contains(value, case=False)]
        return filtered_df.to_dict(orient="records")
    return df.to_dict(orient="records")