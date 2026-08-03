class ExploreValidator:
    """
    Validation utilities checking explore search queries.
    """
    @staticmethod
    def validate_search_params(params):
        """
        Validates query parameters. Returns (is_valid, errors).
        """
        errors = {}
        budget = params.get("budget")
        if budget:
            try:
                float(budget)
            except ValueError:
                errors["budget"] = "Budget parameter must be a number."
        return len(errors) == 0, errors
