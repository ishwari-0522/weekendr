from app.services.explore.world_service import WorldService
from app.services.explore.curation_engine import CurationEngine
from app.models.place import Place, Category

class ExploreService:
    """
    Explore service orchestrating curated worlds details and matching place queries.
    """
    @staticmethod
    def get_world_details(world_id):
        """
        Gathers world config metadata and lists matching places.
        """
        world = WorldService.get_world_by_id(world_id)
        if not world:
            return None
            
        # Query places matching featured categories of the world
        categories = world.get("featured_categories", [])
        places_query = Place.query.filter_by(is_active=True)
        
        if categories:
            places_query = places_query.join(Category).filter(Category.name.in_(categories))
            
        matching_places = places_query.all()
        ranked_places = CurationEngine.rank_places(matching_places)
        
        # Serialize matching places
        places_data = []
        for p in ranked_places[:15]: # Limit to top 15 featured places for this world
            rating = 3.5
            reviews = 0
            if p.google_detail:
                rating = float(p.google_detail.rating or 3.5)
                reviews = int(p.google_detail.review_count or 0)
                
            places_data.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "rating": rating,
                "review_count": reviews,
                "average_cost": float(p.average_cost) if p.average_cost else None,
                "vibe_summary": p.ai_metadata.vibe_summary if p.ai_metadata else "",
                "cover_photo": p.images[0].image_url if p.images else None
            })
            
        return {
            "world": world,
            "featured_places": places_data,
            "recommended_areas": world.get("featured_areas", [])
        }
