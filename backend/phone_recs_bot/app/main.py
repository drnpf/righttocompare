from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.models.chat import ChatState
from app.logic.parse_prefs import update_profile_from_text
from app.logic.retrieve import retrieve_candidates
from app.logic.rank import rank_candidates
from app.logic.respond import make_reply

app = FastAPI(title="Phone Recommendation Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # fine for local demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSIONS: dict[str, ChatState] = {}


class ChatRequest(BaseModel):
    session_id: str
    message: str


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/chat")
async def chat(req: ChatRequest):
    state = SESSIONS.get(req.session_id) or ChatState(session_id=req.session_id)

    # 1) Update preference profile from user message
    state.profile = update_profile_from_text(state.profile, req.message)

    # 2) Retrieve candidates from Mongo
    candidates = await retrieve_candidates(state.profile)

    # 3) Rank candidates
    top = rank_candidates(state.profile, candidates, top_k=5)

    # 4) Build final structured response
    response = make_reply(state.profile, top)

    # 5) Save lightweight session state
    state.last_results = top
    SESSIONS[req.session_id] = state

    return response