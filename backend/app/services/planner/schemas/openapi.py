OPENAPI_SPEC = {
  "openapi": "3.0.0",
  "info": {
    "title": "WEEKENDR Planner API",
    "version": "1.0.0",
    "description": "REST endpoints allowing the WEEKENDR frontend to generate, edit, and audit itineraries."
  },
  "servers": [
    {
      "url": "/api"
    }
  ],
  "paths": {
    "/planner/generate": {
      "post": {
        "summary": "Generate a new chronological outing experience",
        "requestBody": {
          "required": True,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["city", "experience_template"],
                "properties": {
                  "city": { "type": "string", "example": "Pune" },
                  "area": { "type": "string", "example": "Koregaon Park" },
                  "budget": { "type": "number", "example": 2000 },
                  "duration": { "type": "integer", "example": 180 },
                  "group": { "type": "string", "example": "Couple" },
                  "experience_template": { "type": "string", "example": "Coffee & Conversations" },
                  "preferences": {
                    "type": "array",
                    "items": { "type": "string" },
                    "example": ["Late Night"]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": True },
                    "message": { "type": "string", "example": "Experience generated successfully." },
                    "data": { "type": "object" },
                    "errors": { "type": "array", "items": {} }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/planner/edit": {
      "post": {
        "summary": "Edit an existing timeline sequence",
        "requestBody": {
          "required": True,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["current_places", "action"],
                "properties": {
                  "current_places": {
                    "type": "array",
                    "items": { "type": "object" }
                  },
                  "action": {
                    "type": "object",
                    "properties": {
                      "type": { "type": "string", "example": "replace" },
                      "index": { "type": "integer", "example": 1 },
                      "new_place_id": { "type": "integer", "example": 4 }
                    }
                  },
                  "budget": { "type": "number", "example": 2000 },
                  "duration": { "type": "integer", "example": 180 },
                  "template_name": { "type": "string", "example": "Coffee & Conversations" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns updated timeline"
          }
        }
      }
    },
    "/templates": {
      "get": {
        "summary": "Retrieve available experience templates"
      }
    },
    "/categories": {
      "get": {
        "summary": "Retrieve supported place categories"
      }
    },
    "/areas": {
      "get": {
        "summary": "Retrieve areas filtered by city name",
        "parameters": [
          {
            "name": "city",
            "in": "query",
            "required": True,
            "schema": { "type": "string", "example": "Pune" }
          }
        ]
      }
    },
    "/place/{id}": {
      "get": {
        "summary": "Retrieve complete details for a place ID"
      }
    }
  }
}
