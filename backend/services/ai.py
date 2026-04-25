from config import settings
from typing import Dict, List, Optional
from langchain_mistralai import ChatMistralAI


def generate_course_metadata(sessions: List[Dict]) -> Optional[Dict]:
    api_key = settings.MISTRAL_API_KEY
    if not api_key:
        return None

    session_descriptions = []
    for i, session in enumerate(sessions):
        title = session.get("title", "")
        description = session.get("description", "")[:1000]
        session_descriptions.append(f"Session {i+1}: {title}\n{description}")

    sessions_text = "\n\n".join(session_descriptions)

    prompt = f"""You are an expert course designer. Analyze the following course sessions and generate:
1. What students will learn (3-5 bullet points)
2. Prerequisites (2-4 bullet points)

Sessions:
{sessions_text}

Provide the output as a JSON object with two keys:
- "what_you_will_learn": array of strings (3-5 items)
- "prerequisites": array of strings (2-4 items)

Only respond with valid JSON, no additional text."""

    try:
        llm = ChatMistralAI(mistral_api_key=api_key, model="mistral-large-latest")
        response = llm.invoke(prompt)
        content = response.content.strip()

        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        import json
        result = json.loads(content)

        return {
            "what_you_will_learn": result.get("what_you_will_learn", []),
            "prerequisites": result.get("prerequisites", []),
        }
    except Exception as e:
        print(f"Error generating metadata: {e}")
        return None