import os
import json

class WorldService:
    """
    Service reading worlds specifications config JSON.
    """
    @staticmethod
    def _load_worlds():
        try:
            # Dynamically compute path to backend/config/worlds.json
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            path = os.path.join(base_dir, 'config', 'worlds.json')
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f).get("worlds", [])
        except Exception:
            return []

    @classmethod
    def get_all_worlds(cls):
        """Returns list of all parsed worlds."""
        return cls._load_worlds()

    @classmethod
    def get_world_by_id(cls, world_id):
        """Returns specific world details by ID key."""
        worlds = cls._load_worlds()
        for w in worlds:
            if w.get("id") == world_id:
                return w
        return None
