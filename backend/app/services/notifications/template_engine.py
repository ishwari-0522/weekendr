class TemplateEngine:
    """
    Renders templates dynamically based on notification type and variables.
    """
    TEMPLATES = {
        "upcoming_outing": {
            "title": "Upcoming Adventure",
            "message": "Tomorrow is your {template_title} day."
        },
        "starting_soon": {
            "title": "Starting Soon",
            "message": "Your first stop opens in about an hour."
        },
        "reflection_reminder": {
            "title": "Record Your Day",
            "message": "Before the memories fade, tell us what made today special."
        },
        "weekly_inspiration": {
            "title": "Weekend Inspiration",
            "message": "Looking for something different this weekend?"
        },
        "explore_recommendation": {
            "title": "Curated Spot Recommendation",
            "message": "We found a new gem you might love in {area}."
        },
        "system_message": {
            "title": "System Update",
            "message": "{text}"
        }
    }

    @classmethod
    def render(cls, notification_type, **kwargs):
        """
        Returns (title, message) tuple loaded from templates presets.
        """
        tpl = cls.TEMPLATES.get(notification_type)
        if not tpl:
            return "WEEKENDR Alert", "You have a new companion update."
            
        title = tpl["title"]
        message = tpl["message"].format(**kwargs)
        return title, message
