import unittest

from tools.compare_vocabulary import compare_entries, expand_official_row, normalize_word, split_headwords


class VocabularyComparisonTests(unittest.TestCase):
    def test_word_normalization_ignores_case_and_compatibility_width(self):
        self.assertEqual(normalize_word("ＡＰＰＬＥ"), "apple")

    def test_slash_alternatives_expand_to_individual_headwords(self):
        self.assertEqual(split_headwords("actor / actress"), ["actor", "actress"])

    def test_parenthesized_suffix_uses_its_matching_part_of_speech(self):
        self.assertEqual(
            expand_official_row({"word": "agree(ment)", "level": "4", "pos": "v./(n.)"}),
            [
                {"word": "agree", "level": "4", "pos": "v."},
                {"word": "agreement", "level": "4", "pos": "n."},
            ],
        )

    def test_comparison_reports_missing_extra_pos_and_level_counts(self):
        result = compare_entries(
            [
                {"word": "actor/actress", "level": "1", "pos": "n."},
                {"word": "apple", "level": "2", "pos": "n."},
            ],
            [
                {"word": "actor", "pos": "n."},
                {"word": "apple", "pos": "v."},
                {"word": "banana", "pos": "n."},
            ],
        )
        self.assertEqual(result["missing_from_current"], [{"word": "actress", "level": "1", "pos": "n."}])
        self.assertEqual(result["extra_in_current"], ["banana"])
        self.assertEqual(result["pos_mismatches"], [{"word": "apple", "level": "2", "official": "n.", "current": "v."}])
        self.assertEqual(result["level_counts"], {"1": 1, "2": 1})

    def test_duplicate_official_headwords_are_reported(self):
        result = compare_entries(
            [{"word": "Apple", "level": "1", "pos": "n."}, {"word": "apple", "level": "2", "pos": "n."}],
            [],
        )
        self.assertEqual(result["duplicate_official"], ["apple"])


if __name__ == "__main__":
    unittest.main()
