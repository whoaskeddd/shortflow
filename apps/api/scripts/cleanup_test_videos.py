from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from app.cleanup import cleanup_test_videos
from app.db import SessionLocal


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean up legacy test videos and local uploads.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Delete matched test videos and files. Default mode is dry-run.",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        summary = cleanup_test_videos(db, dry_run=not args.apply)
        print(json.dumps(asdict(summary), ensure_ascii=False, indent=2))
    finally:
        db.close()


if __name__ == "__main__":
    main()
