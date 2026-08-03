from app.models.place import Place
from app.models.location import City, Area
from app.services.explore.curation_engine import CurationEngine

class SearchService:
    """
    Search service performing deterministic queries filtering city, category, areas, budget, and tags.
    """
    @staticmethod
    def search_places(
        city_name=None,
        area_name=None,
        category_name=None,
        max_budget=None,
        tags_list=None,
        search_query=None
    ):
        """
        Queries and filters places, returning ranked results.
        """
        query = Place.query.filter_by(is_active=True)
        
        # 1. Filter by City
        if city_name:
            query = query.join(Area).join(City).filter(City.name.ilike(city_name))
            
        # 2. Filter by Area
        if area_name:
            if not city_name:
                query = query.join(Area)
            query = query.filter(Area.name.ilike(area_name))
            
        # 3. Filter by Category
        if category_name:
            from app.models.place import Category
            query = query.join(Category).filter(Category.name.ilike(category_name))
            
        # 4. Filter by Budget
        if max_budget is not None:
            try:
                budget_val = float(max_budget)
                query = query.filter(Place.average_cost <= budget_val)
            except ValueError:
                pass
                
        places = query.all()
        
        # 5. Filter by Tags (vibe matching)
        if tags_list:
            filtered_by_tags = []
            tags_lower = [t.lower() for t in tags_list]
            for p in places:
                place_tags = [t.name.lower() for t in p.tags]
                # Check if all specified tags exist on this place
                if all(t in place_tags for t in tags_lower):
                    filtered_by_tags.append(p)
            places = filtered_by_tags
            
        # 6. Filter by Text query
        if search_query:
            q_lower = search_query.lower()
            filtered_by_text = []
            for p in places:
                name_match = q_lower in p.name.lower()
                desc_match = q_lower in (p.description or "").lower()
                vibe_match = False
                if p.ai_metadata and p.ai_metadata.vibe_summary:
                    vibe_match = q_lower in p.ai_metadata.vibe_summary.lower()
                    
                if name_match or desc_match or vibe_match:
                    filtered_by_text.append(p)
            places = filtered_by_text
            
        # Rank deterministically using the curation engine
        return CurationEngine.rank_places(places)
