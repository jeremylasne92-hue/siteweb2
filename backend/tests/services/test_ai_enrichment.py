# backend/tests/services/test_ai_enrichment.py
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from services.ai_enrichment import extract_youtube_id


def test_extract_youtube_id_watch():
    assert extract_youtube_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"


def test_extract_youtube_id_short():
    assert extract_youtube_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"


def test_extract_youtube_id_embed():
    assert extract_youtube_id("https://www.youtube.com/embed/dQw4w9WgXcQ") == "dQw4w9WgXcQ"


def test_extract_youtube_id_invalid():
    assert extract_youtube_id("https://www.google.com") is None


def test_extract_youtube_id_with_params():
    assert extract_youtube_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120") == "dQw4w9WgXcQ"


def test_extract_youtube_id_empty():
    assert extract_youtube_id("") is None
