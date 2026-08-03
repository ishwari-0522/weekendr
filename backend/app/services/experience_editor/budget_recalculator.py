class BudgetRecalculator:
    """Aggregates cost metrics for places sequence stops."""
    def recalculate_cost(self, places_list):
        """
        Calculates cumulative cost.
        """
        if not places_list:
            return 0.0
            
        total = 0.0
        price_map = {0: 100.0, 1: 200.0, 2: 500.0, 3: 1000.0, 4: 2000.0}
        
        for place in places_list:
            cost = place.get("estimated_cost")
            if cost is not None:
                total += float(cost)
            else:
                # Fallback to price level estimate
                price_level = place.get("price_level")
                if price_level is not None:
                    total += price_map.get(price_level, 400.0)
                else:
                    total += 300.0 # Default fallback
                    
        return round(total, 2)
