from app.services.experience_composer.duration_allocator import DurationAllocator
from app.services.experience_composer.travel_estimator import TravelEstimator
from app.services.experience_composer.segment_builder import SegmentBuilder
from app.services.experience_composer.template_rules import TemplateRules
from app.services.experience_composer.timeline_builder import TimelineBuilder
from app.services.experience_composer.experience_validator import ExperienceValidator
from app.utils.logging import sync_logger, error_logger

class ExperienceComposer:
    """
    Main orchestrator for WEEKENDR Experience Composer.
    Sequences recommended places into a complete outing timeline,
    incorporating travel, durations, and validation parameters.
    """
    def __init__(self, duration_path=None, traffic_multiplier=1.0):
        self.duration_allocator = DurationAllocator(duration_path)
        self.travel_estimator = TravelEstimator(traffic_multiplier=traffic_multiplier)
        self.segment_builder = SegmentBuilder()
        self.template_rules = TemplateRules()
        
        self.timeline_builder = TimelineBuilder(
            segment_builder=self.segment_builder,
            travel_estimator=self.travel_estimator,
            duration_allocator=self.duration_allocator
        )
        self.validator = ExperienceValidator()

    def compose_experience(self, template_name, recommended_places, budget=None, duration=None, group_type=None, preferences=None, start_time="17:00"):
        """
        Assembles place records into a packed chronological timeline.
        Returns a structured JSON dict.
        """
        sync_logger.info("Composing experience for Template '%s' with %d places.", template_name, len(recommended_places))
        
        # 1. Filter out missing optional categories based on template rules
        filtered_places = self.template_rules.filter_optional_places(template_name, recommended_places)
        
        if not filtered_places:
            error_logger.error("No valid places list remained after applying template rules.")
            return {"error": "Failed composition. No places available."}

        # 2. Build chronological timeline
        timeline = self.timeline_builder.build_timeline(
            places_list=filtered_places,
            start_time_str=start_time,
            user_duration_mins=duration
        )
        
        # 3. Audit timeline constraints
        is_valid, reason = self.validator.validate_experience(timeline, budget, duration)
        if not is_valid:
            error_logger.warning("Timeline Validation Warning: %s", reason)
            # Proceed anyway but attach validation note
            timeline["validation_note"] = reason
            
        # 4. Calculate total budget spent based on segments
        total_cost = sum(s.get("estimated_cost", 0.0) for s in timeline["segments"] if s["type"] == "activity")
        
        # 5. Populate metadata block to prepare for future enrichment (Weather, Traffic, Seasonality, Events)
        timeline.update({
            "experience_template": template_name,
            "total_budget": round(total_cost, 2),
            "metadata": {
                "weather_check": "passed",
                "weather_forecast": "clear_sky", # Future weather enrichment placeholder
                "traffic_congestion_factor": self.travel_estimator.traffic_multiplier,
                "seasonal_override_applied": False,
                "local_events_delay_applied": False,
                "group_type": group_type,
                "preferences": preferences or []
            }
        })
        
        sync_logger.info("Experience composed successfully. End Time: %s, Total Duration: %d mins", 
                         timeline["end_time"], timeline["total_duration"])
                         
        return timeline
