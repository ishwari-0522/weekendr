class BudgetAllocator:
    """
    Distributes the user's total budget across experience categories based on template weights.
    """
    def allocate_budget(self, total_budget, template_config):
        """
        Splits total budget.
        Returns a dict mapping category name -> allocated rupee budget.
        """
        if not template_config or not total_budget:
            return {}
            
        weights = template_config.get("budget_weights", {})
        allocations = {}
        
        # Calculate allocations based on floats
        for category, weight in weights.items():
            allocations[category] = round(float(total_budget) * float(weight), 2)
            
        return allocations
