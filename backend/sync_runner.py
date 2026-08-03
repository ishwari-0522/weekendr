import argparse
from app import create_app
from app.services.data_ingestion.sync_runner import DataIngestionSyncRunner

def main():
    parser = argparse.ArgumentParser(description="WEEKENDR Data Ingestion CLI")
    parser.add_argument(
        "--city", 
        type=str, 
        help="Specific city name to sync (e.g. Pune, Mumbai)"
    )
    parser.add_argument(
        "--limit", 
        type=int, 
        help="Limit on total places to insert/update in this run"
    )
    parser.add_argument(
        "--dry-run", 
        action="store_true", 
        help="Perform search, geocoding, and tag generation, but do not write to database"
    )
    parser.add_argument(
        "--resume", 
        action="store_true", 
        help="Resumes sync process from last saved checkpoint in sync_progress.json"
    )
    
    args = parser.parse_args()
    
    # Initialize Flask app and push context so database models/sessions are active
    app = create_app()
    with app.app_context():
        runner = DataIngestionSyncRunner(
            limit=args.limit, 
            dry_run=args.dry_run,
            resume=args.resume
        )
        runner.run_sync(target_city=args.city)

if __name__ == '__main__':
    main()
