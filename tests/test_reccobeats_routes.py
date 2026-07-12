from app import app
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "src")))

from api.routes import _normalize_lastfm_album


LASTFM_ALBUM_SEARCH_RESPONSE = """
{
  "results": {
    "albummatches": {
      "album": [
        {
          "name": "Random Access Memories",
          "artist": "Daft Punk",
          "url": "https://www.last.fm/music/Daft+Punk/Random+Access+Memories",
          "image": [
            {"#text": "https://lastfm.example/extralarge.jpg", "size": "extralarge"}
          ],
          "mbid": "alb-1"
        },
        {
          "name": "Sin Artista",
          "artist": "",
          "url": "https://www.last.fm/music/Sin+Artista",
          "image": [],
          "mbid": ""
        }
      ]
    }
  }
}
"""

LASTFM_ALBUM_INFO_RESPONSE = """
{
  "album": {
    "artist": "Rammstein",
    "mbid": "15b602a8-07d0-43f6-a0bd-10cde8b3a0b1",
    "name": "Rosenrot",
    "url": "https://www.last.fm/music/Rammstein/Rosenrot",
    "listeners": "781782",
    "playcount": "27341481",
    "image": [
      {"size": "extralarge", "#text": "https://lastfm.example/rosenrot.jpg"}
    ],
    "tags": {
      "tag": [
        {"name": "industrial metal"},
        {"name": "metal"}
      ]
    },
    "tracks": {
      "track": [
        {
          "name": "Benzin",
          "duration": 226,
          "url": "https://www.last.fm/music/Rammstein/Rosenrot/Benzin",
          "@attr": {"rank": 1}
        }
      ]
    }
  }
}
"""


class LastFmRoutesTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_search_requires_query(self):
        response = self.client.get("/api/lastfm/search")
        self.assertEqual(response.status_code, 400)
        self.assertIn("query", response.get_json()["error"].lower())

    def test_album_detail_requires_params(self):
        response = self.client.get("/api/lastfm/album")
        self.assertEqual(response.status_code, 400)
        self.assertIn("artist", response.get_json()["error"].lower())

    @patch.dict(os.environ, {"LASTFM_API_KEY": "test-key"})
    @patch("api.routes.urlopen")
    def test_search_uses_album_search_method(self, mock_urlopen):
        class FakeResponse:
            def __init__(self, payload):
                self._payload = payload

            def read(self):
                return self._payload.encode("utf-8")

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

        mock_urlopen.return_value = FakeResponse(LASTFM_ALBUM_SEARCH_RESPONSE)

        response = self.client.get("/api/lastfm/search?q=daft%20punk")

        self.assertEqual(response.status_code, 200)
        request = mock_urlopen.call_args.args[0]
        self.assertIn("method=album.search", request.full_url)
        self.assertIn("album=daft+punk", request.full_url)

    @patch.dict(os.environ, {"LASTFM_API_KEY": "test-key"})
    @patch("api.routes.urlopen")
    def test_search_skips_results_without_artist_or_name(self, mock_urlopen):
        class FakeResponse:
            def __init__(self, payload):
                self._payload = payload

            def read(self):
                return self._payload.encode("utf-8")

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

        mock_urlopen.return_value = FakeResponse(LASTFM_ALBUM_SEARCH_RESPONSE)

        response = self.client.get("/api/lastfm/search?q=daft%20punk")

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data["results"]), 1)
        self.assertEqual(data["results"][0]["name"], "Random Access Memories")

    @patch.dict(os.environ, {"LASTFM_API_KEY": "test-key"})
    @patch("api.routes.urlopen")
    def test_album_detail_uses_artist_and_album_query_params(self, mock_urlopen):
        class FakeResponse:
            def __init__(self, payload):
                self._payload = payload

            def read(self):
                return self._payload.encode("utf-8")

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

        mock_urlopen.return_value = FakeResponse(LASTFM_ALBUM_INFO_RESPONSE)

        response = self.client.get(
            "/api/lastfm/album?artist=Rammstein&album=Rosenrot")

        self.assertEqual(response.status_code, 200)
        request = mock_urlopen.call_args.args[0]
        self.assertIn("method=album.getInfo", request.full_url)
        self.assertIn("artist=Rammstein", request.full_url)
        self.assertIn("album=Rosenrot", request.full_url)

        data = response.get_json()
        self.assertEqual(data["album"]["name"], "Rosenrot")
        self.assertEqual(data["album"]["artist"], "Rammstein")

    @patch.dict(os.environ, {"LASTFM_API_KEY": "test-key"})
    @patch("api.routes.urlopen")
    def test_album_detail_by_mbid(self, mock_urlopen):
        class FakeResponse:
            def __init__(self, payload):
                self._payload = payload

            def read(self):
                return self._payload.encode("utf-8")

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

        mock_urlopen.return_value = FakeResponse(LASTFM_ALBUM_INFO_RESPONSE)

        response = self.client.get(
            "/api/lastfm/album?mbid=15b602a8-07d0-43f6-a0bd-10cde8b3a0b1")

        self.assertEqual(response.status_code, 200)
        request = mock_urlopen.call_args.args[0]
        self.assertIn("mbid=15b602a8-07d0-43f6-a0bd-10cde8b3a0b1", request.full_url)

    def test_normalize_album_accepts_single_track_object(self):
        album = _normalize_lastfm_album({
            "artist": "Artist",
            "name": "Single Track Album",
            "tracks": {
                "track": {
                    "name": "Only Song",
                    "duration": 180,
                }
            },
        })

        self.assertEqual(len(album["tracks"]), 1)
        self.assertEqual(album["tracks"][0]["name"], "Only Song")
        self.assertEqual(album["tracks"][0]["duration"], 180)

    def test_normalize_album_accepts_single_tag_object(self):
        album = _normalize_lastfm_album({
            "artist": "Artist",
            "name": "Single Tag Album",
            "tags": {
                "tag": {
                    "name": "rock",
                }
            },
        })

        self.assertEqual(album["tags"], ["rock"])


if __name__ == "__main__":
    unittest.main()
