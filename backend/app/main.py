from fastapi import FastAPI

app = FastAPI(title="AppTagaste")

@app.get("/health")
def health():
    return {"status": "ok"}