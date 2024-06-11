from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import sheet_processing
import tempfile
import os
import json
from datetime import datetime

app = FastAPI()


def convert_to_serializable(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


@app.post("/process-excel/")
async def process_excel(file: UploadFile = File(...)):
    # Verify the file extension
    if not file.filename.endswith((".xlsx", ".xlsm", ".xltx", ".xltm")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload an Excel file with one of the following extensions: .xlsx, .xlsm, .xltx, .xltm",
        )

    # Save the uploaded file to a temporary location
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        # Process the file using the sheet_processing module
        tables = sheet_processing.process_file(temp_file_path)

        # Convert the tables to JSON-serializable format
        tables_json = []
        for table in tables:
            df = pd.DataFrame(table)
            tables_json.append(df.to_dict(orient="records"))

        # Convert datetime objects to strings
        tables_json_serializable = json.loads(
            json.dumps({"tables": tables_json}, default=convert_to_serializable)
        )

        return JSONResponse(content=tables_json_serializable)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        os.remove(temp_file_path)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
