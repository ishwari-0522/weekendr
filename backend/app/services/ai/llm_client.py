import os
from abc import ABC, abstractmethod
from openai import OpenAI
from app.utils.logging import api_logger, error_logger

class LLMClient(ABC):
    """Abstract Base Class for LLM providers (OpenAI, Gemma, Llama, etc.)."""
    @abstractmethod
    def generate_json(self, system_prompt, user_prompt):
        pass

class OpenAILLMClient(LLMClient):
    """OpenAI ChatCompletion Client integration."""
    def __init__(self, api_key=None, model="gpt-4o-mini"):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.model = model
        self.client = None
        if self.api_key and "placeholder" not in self.api_key.lower():
            self.client = OpenAI(api_key=self.api_key)
        else:
            api_logger.warning("OPENAI_API_KEY environment variable is not set or is placeholder. Client will operate in dry-run/mock mode.")

    def generate_json(self, system_prompt, user_prompt):
        """Calls OpenAI with JSON mode enabled."""
        if not self.client:
            # Fallback Mock for testing/development environments
            api_logger.warning("[MOCK LLM] Simulating response for: '%s'", user_prompt)
            # Default mock json response matching preference parser output
            return self._get_mock_response(user_prompt)
            
        try:
            api_logger.info("Calling OpenAI API with model: %s", self.model)
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.0
            )
            raw_text = response.choices[0].message.content
            return raw_text
        except Exception as e:
            error_logger.exception("OpenAI API completion failure: %s", str(e))
            raise

    def _get_mock_response(self, text):
        """Simulates LLM JSON response extraction based on input keywords for tests."""
        text_lower = text.lower()
        
        # Defaults
        city = "Pune"
        area = None
        group_type = None
        group_size = None
        budget = None
        duration = None
        template = "Coffee & Conversations"
        preferences = []
        
        if "mumbai" in text_lower or "bandra" in text_lower:
            city = "Mumbai"
        if "baner" in text_lower:
            area = "Baner"
        elif "bandra" in text_lower:
            area = "Bandra"
            
        if "friends" in text_lower or "college" in text_lower:
            group_type = "Friends"
            template = "Game On"
        elif "date" in text_lower or "couple" in text_lower:
            group_type = "Couple"
            template = "Date Night"
            
        if "four" in text_lower or "4" in text_lower:
            group_size = 4
            
        if "2500" in text_lower:
            budget = 2500.0
            
        if "three" in text_lower or "3 hours" in text_lower:
            duration = 180
            
        if "rain" in text_lower or "indoors" in text_lower:
            preferences.append("Indoor")
            
        import json
        return f"""
        {{
            "city": "{city}",
            "area": {f'"{area}"' if area else 'null'},
            "group_type": {f'"{group_type}"' if group_type else 'null'},
            "group_size": {group_size if group_size else 'null'},
            "budget": {budget if budget else 'null'},
            "duration_mins": {duration if duration else 'null'},
            "experience_template": "{template}",
            "preferences": {json.dumps(preferences)}
        }}
        """
