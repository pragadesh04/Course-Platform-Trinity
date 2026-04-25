import yt_dlp
import re


def get_video_info(url: str) -> dict:
    try:
        ydl_opts = {"quiet": True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get("title", "Untitled"),
                "duration": round(info.get("duration", 0) / 60, 2),
            }
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return {"title": "Untitled", "duration": 0}


def get_video_metadata(urls: list) -> list:
    results = []
    for url in urls:
        if not url.strip():
            results.append({"title": "Untitled", "duration": 0, "description": ""})
            continue
        try:
            ydl_opts = {"quiet": True}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                results.append(
                    {
                        "title": info.get("title", "Untitled"),
                        "duration": round(info.get("duration", 0) / 60, 2),
                        "description": info.get("description", ""),
                    }
                )
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            results.append({"title": "Untitled", "duration": 0, "description": ""})
    return results
