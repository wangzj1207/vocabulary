"""Compare the bundled vocabulary with an externally prepared official CSV.

The CSV must contain ``word``, ``level``, and ``pos`` columns. This tool does
not bundle or redistribute the source list; it reports a local comparison.
"""

import argparse
import csv
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PREFIX = "window.VOCABULARY = "


def normalize_word(word):
    return unicodedata.normalize("NFKC", word).strip().casefold()


def normalize_pos(pos):
    return tuple(sorted({part.strip().strip("().").casefold() for part in pos.split("/") if part.strip("(). ")}))


def split_headwords(value):
    return [part.strip() for part in value.split("/") if part.strip()]


def expand_official_row(row):
    suffix = re.fullmatch(r"(.+?)\(([^()]+)\)", row["word"])
    if suffix and "/(" in row["pos"]:
        base_pos, suffix_pos = row["pos"].split("/(", 1)
        suffix_pos = suffix_pos.rstrip(")")
        return [
            {**row, "word": suffix.group(1), "pos": base_pos},
            {**row, "word": suffix.group(1) + suffix.group(2), "pos": suffix_pos},
        ]
    return [{**row, "word": headword} for headword in split_headwords(row["word"])]


def load_current(path):
    text = Path(path).read_text(encoding="utf-8").strip()
    if not text.startswith(PREFIX) or not text.endswith(";"):
        raise ValueError("current file must assign a JSON array to window.VOCABULARY")
    entries = json.loads(text[len(PREFIX) : -1])
    return [{"word": entry["word"], "pos": entry["pos"]} for entry in entries]


def load_official(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        required = {"word", "level", "pos"}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError("official CSV must have word, level, and pos columns")
        return [
            {"word": row["word"].strip(), "level": row["level"].strip(), "pos": row["pos"].strip()}
            for row in reader
            if row.get("word", "").strip()
        ]


def compare_entries(official, current):
    current_by_word = {normalize_word(row["word"]): row for row in current}
    official_by_word = {}
    duplicate_official = set()
    level_counts = Counter()

    for row in official:
        level_counts[row["level"]] += 1
        for expanded in expand_official_row(row):
            headword = expanded["word"]
            key = normalize_word(headword)
            if key in official_by_word:
                duplicate_official.add(headword)
            official_by_word[key] = expanded

    missing = []
    pos_mismatches = []
    for key, official_row in sorted(official_by_word.items()):
        current_row = current_by_word.get(key)
        if current_row is None:
            missing.append(official_row)
        elif normalize_pos(current_row["pos"]) != normalize_pos(official_row["pos"]):
            pos_mismatches.append({
                "word": official_row["word"],
                "level": official_row["level"],
                "official": official_row["pos"],
                "current": current_row["pos"],
            })

    extras = sorted(row["word"] for key, row in current_by_word.items() if key not in official_by_word)
    return {
        "official_rows": len(official),
        "official_headwords": len(official_by_word),
        "current_headwords": len(current_by_word),
        "level_counts": dict(sorted(level_counts.items())),
        "duplicate_official": sorted(duplicate_official, key=str.casefold),
        "missing_from_current": missing,
        "extra_in_current": extras,
        "pos_mismatches": pos_mismatches,
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("official_csv", help="local CSV export with word,level,pos columns")
    parser.add_argument("--current", default=ROOT / "vocabulary.js", help="current vocabulary.js file")
    parser.add_argument("--check", action="store_true", help="return exit status 1 when differences exist")
    args = parser.parse_args(argv)

    try:
        result = compare_entries(load_official(args.official_csv), load_current(args.current))
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as error:
        parser.error(str(error))

    print(json.dumps(result, ensure_ascii=False, indent=2))
    has_differences = any(result[key] for key in ("duplicate_official", "missing_from_current", "extra_in_current", "pos_mismatches"))
    return int(args.check and has_differences)


if __name__ == "__main__":
    sys.exit(main())
