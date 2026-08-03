from app.services.ai.llm_client import OpenAILLMClient
from app.services.ai.prompt_builder import PromptBuilder
from app.services.ai.response_parser import ResponseParser
from app.services.ai.confidence_checker import ConfidenceChecker
from app.utils.logging import sync_logger, error_logger

class PreferenceInterpreter:
    """
    Main orchestrator that uses LLMs to interpret natural language requests
    and extracts structured preference JSON documents.
    """
    def __init__(self, llm_client=None):
        self.llm_client = llm_client or OpenAILLMClient()
        self.prompt_builder = PromptBuilder()
        self.response_parser = ResponseParser()
        self.confidence_checker = ConfidenceChecker()

    def interpret_request(self, user_text):
        """
        Interprets natural language request.
        Returns a structured JSON preferences dictionary.
        """
        sync_logger.info("AI Interpreter: Input text received: '%s'", user_text)
        
        system_prompt = self.prompt_builder.get_system_prompt()
        user_prompt = self.prompt_builder.build_user_prompt(user_text)
        
        try:
            # 1. Query LLM client
            raw_response = self.llm_client.generate_json(system_prompt, user_prompt)
            sync_logger.debug("AI Interpreter: Raw LLM response: %s", raw_response)
            
            # 2. Parse JSON
            parsed_data, is_valid, reason = self.response_parser.parse_response(raw_response)
            sync_logger.info("AI Interpreter: Parser validity: %s. Reason: %s", is_valid, reason)
            
            if not is_valid:
                # Fallback to empty audited format if JSON decoding completely failed
                parsed_data = {}
                
            # 3. Audit confidence values and assign fallbacks
            audited_data = self.confidence_checker.audit_preferences(parsed_data)
            
            # Log final parsed document
            sync_logger.info("AI Interpreter: Final structured preferences: %s", audited_data)
            
            return audited_data
        except Exception as e:
            error_logger.exception("AI Interpreter failed to interpret request: %s", str(e))
            # Return baseline fallback defaults rather than crashing
            return self.confidence_checker.audit_preferences({})
