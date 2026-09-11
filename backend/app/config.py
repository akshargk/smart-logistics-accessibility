"""
SmartLogix SIH Backend — Configuration
Reads all settings from environment variables / .env file.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os


class Settings(BaseSettings):
    # Application
    app_env: str = "development"
    app_name: str = "SmartLogix SIH Backend"
    app_version: str = "0.1.0"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Database
    database_url: str = "sqlite+aiosqlite:///./sih_backend.db"
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_uri: str = ""
    mongodb_database: str = "smartlogix"
    mongodb_db: str = ""

    # Demo / Simulation mode
    demo_mode: bool = True

    # External API keys (all optional — fallback to mock data)
    openweather_api_key: str = ""
    google_maps_api_key: str = ""

    @property
    def effective_mongodb_url(self) -> str:
        return (
            self.mongodb_uri
            or self.mongodb_url
            or os.environ.get("MONGODB_URI")
            or os.environ.get("MONGODB_URL")
            or "mongodb://localhost:27017"
        )

    @property
    def effective_mongodb_database(self) -> str:
        return (
            self.mongodb_db
            or self.mongodb_database
            or os.environ.get("MONGODB_DB")
            or os.environ.get("MONGODB_DATABASE")
            or "smartlogix"
        )

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()
