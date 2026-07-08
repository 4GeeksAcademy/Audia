from app import app
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "src")))


class ReccoBeatsRoutesTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_search_requires_query(self):
        response = self.client.get("/api/reccobeats/search")
        self.assertEqual(response.status_code, 400)
        self.assertIn("query", response.get_json()["error"].lower())

    @patch("api.routes.urlopen")
    def test_search_uses_searchtext_param_when_calling_reccobeats(self, mock_urlopen):
        class FakeResponse:
            def __init__(self, payload):
                self._payload = payload

            def read(self):
                return self._payload.encode("utf-8")

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

        mock_urlopen.return_value = FakeResponse('{"results": []}')

        response = self.client.get(
            "/api/reccobeats/search?q=daft%20punk&type=all")

        self.assertEqual(response.status_code, 200)
        request = mock_urlopen.call_args.args[0]
        self.assertIn("searchText=daft+punk", request.full_url)

    @patch("api.routes.urlopen")
    def test_search_returns_normalized_results(self, mock_urlopen):
        class FakeResponse:
            def __init__(self, payload):
                self._payload = payload

            def read(self):
                return self._payload.encode("utf-8")

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

        mock_urlopen.return_value = FakeResponse(
            '{"results": [{"id": "alb-1", "name": "Random Access Memories", "type": "album", "cover": "https://cdn.example.com/cover.jpg", "artists": [{"name": "Daft Punk"}]}, {"id": "art-1", "name": "Daft Punk", "type": "artist", "image": "https://cdn.example.com/artist.jpg"}]}'
        )

        response = self.client.get(
            "/api/reccobeats/search?q=daft%20punk&type=all")

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["query"], "daft punk")
        self.assertEqual(len(data["results"]), 2)
        self.assertEqual(data["results"][0]["type"], "album")
        self.assertEqual(data["results"][1]["name"], "Daft Punk")

    @patch("api.routes.urlopen")
    def test_item_detail_returns_artist_payload(self, mock_urlopen):
        class FakeResponse:
            def __init__(self, payload):
                self._payload = payload

            def read(self):
                return self._payload.encode("utf-8")

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

        mock_urlopen.return_value = FakeResponse(
            '{"id": "art-1", "name": "Daft Punk", "image": "https://cdn.example.com/artist.jpg"}'
        )

        response = self.client.get("/api/reccobeats/item/artist/art-1")

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["artist"]["name"], "Daft Punk")


if __name__ == "__main__":
    unittest.main()
