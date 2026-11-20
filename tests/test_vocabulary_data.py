import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_vocabulary():
    source = (ROOT / "vocabulary.js").read_text(encoding="utf-8").strip()
    prefix = "window.VOCABULARY = "
    if not source.startswith(prefix) or not source.endswith(";"):
        raise AssertionError("vocabulary.js must assign a JSON array to window.VOCABULARY")
    return json.loads(source[len(prefix) : -1])


class VocabularyDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.words = load_vocabulary()

    def test_word_count_and_unique_headwords(self):
        headwords = [entry["word"].casefold() for entry in self.words]
        self.assertGreaterEqual(len(self.words), 5500)
        self.assertEqual(len(headwords), len(set(headwords)))

    def test_entries_have_required_fields_and_chinese_meanings(self):
        for entry in self.words:
            with self.subTest(word=entry.get("word")):
                self.assertTrue(entry.get("word", "").strip())
                self.assertTrue(entry.get("pos", "").strip())
                meaning = entry.get("meaning", "").strip()
                self.assertTrue(meaning)
                self.assertRegex(meaning, r"[\u3400-\u9fff]")

    def test_meanings_do_not_start_with_leftover_pos_markers(self):
        marker = re.compile(r"^\s*/?\s*(?:n|v|adj|adv|prep|conj|pron|art|aux|int|num|phr|prop)\s*\.", re.I)
        leftovers = [entry["word"] for entry in self.words if marker.search(entry["meaning"])]
        self.assertEqual(leftovers, [])

    def test_every_entry_has_three_fallback_distractor_meanings(self):
        meanings = {entry["meaning"] for entry in self.words}
        for entry in self.words:
            with self.subTest(word=entry["word"]):
                self.assertGreaterEqual(len(meanings - {entry["meaning"]}), 3)


if __name__ == "__main__":
    unittest.main()
