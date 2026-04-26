import os
from typing import List
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()

class ProductAI:
    def __init__(self):
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise ValueError("MISTRAL_API_KEY not found in environment")
        
        self.model = ChatMistralAI(
            model="mistral-large-latest",
            mistral_api_key=api_key,
            temperature=0.7
        )

    async def generate_description(self, title: str) -> str:
        """Generates a premium, cosmic-themed e-commerce description."""
        system_prompt = (
            "You are a luxury e-commerce copywriter for 'Trinity Course Platform'. "
            "Write a premium, immersive product description (100-150 words) "
            "based on the product title. Use a sophisticated, slightly 'cosmic' or 'futuristic' tone. "
            "Focus on quality, exclusivity, and the experience of using the product. "
            "Output plain text ONLY - no markdown, no asterisks, no formatting."
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Product Title: {title}")
        ]
        
        response = await self.model.ainvoke(messages)
        return response.content.strip()

    async def generate_title(self, title: str) -> str:
        """Enhances a product title."""
        system_prompt = (
            "You are an expert product namer for 'Trinity Course Platform'. "
            "Improve and enhance the product title to make it more compelling and professional. "
            "Keep it concise (5-10 words). "
            "Output plain text ONLY - no markdown, no asterisks, just the title."
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Current Title: {title}")
        ]
        
        response = await self.model.ainvoke(messages)
        return response.content.strip()

    async def generate_features(self, title: str, description: str) -> List[str]:
        """Generates a list of premium key features."""
        system_prompt = (
            "You are an e-commerce specialist for high-end digital and physical goods. "
            "Based on the title and description, extract 6-8 premium key features. "
            "Features should sound exclusive and professional. "
            "Return ONLY the list of features, one per line, without numbers or bullets."
        )
        
        content = f"Product Title: {title}\nProduct Description: {description}"
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=content)
        ]
        
        response = await self.model.ainvoke(messages)
        features = [f.strip() for f in response.content.split("\n") if f.strip()]
        return features[:10]

    async def generate_tags(self, title: str, description: str) -> List[str]:
        """Generates SEO-friendly tags."""
        system_prompt = (
            "Generate 5-10 SEO-friendly, one-word or two-word tags for this product. "
            "Return the tags as a comma-separated list only."
        )
        
        content = f"Product Title: {title}\nProduct Description: {description}"
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=content)
        ]
        
        response = await self.model.ainvoke(messages)
        tags = [t.strip().lower() for t in response.content.split(",") if t.strip()]
        return tags

    async def generate_course_description(self, title: str) -> str:
        """Generates a course description based on title."""
        system_prompt = (
            "You are an expert course instructor for 'Trinity Course Platform'. "
            "Write a compelling course description (100-150 words) "
            "based on the course title. Focus on what students will learn, "
            "the value they will gain, and why this course is valuable. "
            "Output plain text ONLY - no markdown, no asterisks, no formatting."
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Course Title: {title}")
        ]
        
        response = await self.model.ainvoke(messages)
        return response.content.strip()

    async def generate_course_title(self, title: str) -> str:
        """Enhances a course title based on the input."""
        system_prompt = (
            "You are an expert course namer for 'Trinity Course Platform'. "
            "Improve and enhance the course title to make it more compelling and professional. "
            "Keep it concise (5-10 words). "
            "Output plain text ONLY - no markdown, no asterisks, just the title."
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Current Title: {title}")
        ]
        
        response = await self.model.ainvoke(messages)
        return response.content.strip()

    async def generate_course_learnings(self, title: str, description: str) -> List[str]:
        """Generates learning outcomes based on title and description."""
        system_prompt = (
            "You are an expert curriculum designer. "
            "Based on the course title and description, create 6-8 learning outcomes. "
            "Each outcome should start with an action verb and describe a skill or knowledge "
            "students will gain. Return ONLY the list of outcomes, one per line, without numbers or bullets."
        )
        
        content = f"Course Title: {title}\nCourse Description: {description}"
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=content)
        ]
        
        response = await self.model.ainvoke(messages)
        learnings = [l.strip() for l in response.content.split("\n") if l.strip()]
        return learnings[:10]

product_ai = ProductAI()
course_ai = ProductAI()