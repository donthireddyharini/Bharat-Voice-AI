"""SQLAlchemy ORM models: Users, Conversations, Messages, Documents, SearchHistory."""
import uuid
import datetime as dt

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from database.db import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=True)
    preferred_language = Column(String, default="en")
    state = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    interests = Column(JSON, default=list)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    conversations = relationship("Conversation", back_populates="user")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String, default="New conversation")
    language = Column(String, default="en")
    created_at = Column(DateTime, default=dt.datetime.utcnow)
    updated_at = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=gen_id)
    conversation_id = Column(String, ForeignKey("conversations.id"))
    role = Column(String)  # "user" | "assistant"
    content = Column(Text)
    language = Column(String, default="en")
    sources = Column(JSON, default=list)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class DocumentRecord(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    filename = Column(String)
    file_type = Column(String)
    extracted_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    query = Column(Text)
    language = Column(String, default="en")
    result_count = Column(String, default="0")
    created_at = Column(DateTime, default=dt.datetime.utcnow)
