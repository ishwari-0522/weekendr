from app.services.experience_composer.timeline_builder import TimelineBuilder
from app.services.experience_composer.segment_builder import SegmentBuilder
from app.services.experience_composer.travel_estimator import TravelEstimator
from app.services.experience_composer.duration_allocator import DurationAllocator

class TimelineUpdater:
    """
    Updates arrival/departure times, travel transit durations, and sequence
    segments of the edited outing while preserving unedited stops.
    """
    def __init__(self, duration_path=None, traffic_multiplier=1.0):
        self.segment_builder = SegmentBuilder()
        self.travel_estimator = TravelEstimator(traffic_multiplier=traffic_multiplier)
        self.duration_allocator = DurationAllocator(duration_path)
        self.timeline_builder = TimelineBuilder(
            segment_builder=self.segment_builder,
            travel_estimator=self.travel_estimator,
            duration_allocator=self.duration_allocator
        )

    def update_timeline(self, places_list, start_time="17:00", user_duration=None):
        """
        Recomputes chronological timestamps and travel segments for the places sequence.
        """
        return self.timeline_builder.build_timeline(
            places_list=places_list,
            start_time_str=start_time,
            user_duration_mins=user_duration
        )
