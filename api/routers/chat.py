import uuid
import os
import tempfile
import pandas as pd
from pydantic import BaseModel
from dotenv import load_dotenv
import sheet_processing
from openai import OpenAI
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

sessions = {}

router = APIRouter()


class Query(BaseModel):
    question: str


@router.post("/chat/")
async def start_chat(file: UploadFile = File(...)):
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

        # Flatten tables to a single string for query context
        context = ""
        for table in tables:
            df = pd.DataFrame(table)
            context += df.to_string() + "\n\n"

        # Create a session ID
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "context": context,
            "history": [],
            "api_key": openai_api_key,
        }

        return JSONResponse(content={"session_id": session_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(temp_file_path)


@router.post("/chat/{session_id}")
async def chat(session_id: str, query: Query):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    if not query.question or len(query.question) == 0:
        raise HTTPException(
            status_code=400, detail="You must provide a question to ask."
        )

    question = query.question

    session = sessions[session_id]
    context = session["context"]
    history = session["history"]

    history.append({"role": "user", "content": question})

    def generate():
        prompt = f"Data: {context}\n\n Question: {question}. Please provide a detailed answer only based on the data provided. Also include the data you used to answer the question and any assumptions you made."
        stream = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=history + [{"role": "user", "content": prompt}],
            stream=True,
        )
        response_content = ""
        for chunk in stream:
            content = chunk.choices[0].delta.content or ""
            response_content += content
            yield content

        history.append({"role": "assistant", "content": response_content})

    return StreamingResponse(generate(), media_type="text/plain")
