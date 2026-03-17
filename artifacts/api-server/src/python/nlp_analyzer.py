#!/usr/bin/env python3
"""
OMNIMENS NLP Analysis Engine — spaCy + NLTK
STDIN: JSON {action, text, options}
Actions: analyze, entities, keywords, sentiment, summarize, pos_tags, syntax
"""
import sys, json, re
from collections import Counter

def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

def load_spacy():
    import spacy
    # Try to load English model, download if needed
    try: return spacy.load("en_core_web_sm")
    except OSError:
        try:
            from spacy.cli import download
            download("en_core_web_sm")
            return spacy.load("en_core_web_sm")
        except: return None

def process(spec: dict) -> dict:
    action = spec.get("action", "analyze")
    text = spec.get("text", "")
    options = spec.get("options", {})

    if not text: error_out("text is required")
    if len(text) > 100000: text = text[:100000]

    # ── Full Analysis ────────────────────────────────────────────────────────
    if action in ("analyze", "full"):
        results = {}

        # Basic stats
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        results["stats"] = {
            "char_count": len(text),
            "word_count": len(words),
            "sentence_count": len(sentences),
            "avg_word_length": round(sum(len(w) for w in words) / max(len(words), 1), 1),
            "avg_sentence_length": round(len(words) / max(len(sentences), 1), 1),
            "reading_time_minutes": round(len(words) / 200, 1),
        }

        # Keyword frequency
        stopwords = {"the","a","an","and","or","but","in","on","at","to","for","of","with","is","was","are","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","need","dare","ought","used","this","that","these","those","it","its","i","you","he","she","we","they","me","him","her","us","them","my","your","his","our","their"}
        clean_words = [w.lower().strip('.,!?;:"\'()[]{}') for w in words]
        freq = Counter(w for w in clean_words if w and w not in stopwords and len(w) > 2)
        results["keywords"] = [{"word": w, "count": c} for w, c in freq.most_common(20)]

        # spaCy entities
        nlp = load_spacy()
        if nlp:
            doc = nlp(text[:10000])
            entities = {}
            for ent in doc.ents:
                label = ent.label_
                if label not in entities: entities[label] = []
                if ent.text not in entities[label]: entities[label].append(ent.text)
            results["named_entities"] = entities
            results["entity_count"] = sum(len(v) for v in entities.values())

            # Noun chunks (key phrases)
            chunks = list(set([chunk.text for chunk in doc.noun_chunks if len(chunk.text.split()) >= 2]))
            results["key_phrases"] = chunks[:20]

            # Sentence analysis
            sent_data = []
            for sent in list(doc.sents)[:10]:
                sent_data.append({"text": sent.text.strip(), "token_count": len(sent)})
            results["sentences"] = sent_data
        else:
            results["note"] = "spaCy model not available — basic analysis only"

        # Simple sentiment (rule-based)
        pos_words = {"excellent","great","good","best","amazing","wonderful","fantastic","love","perfect","awesome","happy","beautiful","positive","success"}
        neg_words = {"bad","terrible","awful","worst","hate","horrible","disgusting","failure","problem","issue","wrong","broken","failed","negative","poor"}
        pos_count = sum(1 for w in clean_words if w in pos_words)
        neg_count = sum(1 for w in clean_words if w in neg_words)
        if pos_count > neg_count: sentiment = "positive"
        elif neg_count > pos_count: sentiment = "negative"
        else: sentiment = "neutral"
        results["sentiment"] = {"label": sentiment, "positive_signals": pos_count, "negative_signals": neg_count}

        return {"success": True, "action": "analyze", **results}

    elif action == "entities":
        nlp = load_spacy()
        if not nlp: error_out("spaCy not available")
        doc = nlp(text[:10000])
        entities = []
        for ent in doc.ents:
            entities.append({"text": ent.text, "label": ent.label_, "description": spacy.explain(ent.label_) or ""})
        entity_groups = {}
        for e in entities:
            if e["label"] not in entity_groups: entity_groups[e["label"]] = []
            if e["text"] not in entity_groups[e["label"]]: entity_groups[e["label"]].append(e["text"])
        return {"success": True, "action": "entities", "entities": entities, "grouped": entity_groups}

    elif action == "keywords":
        words = text.split()
        stopwords = {"the","a","an","and","or","but","in","on","at","to","for","of","with","is","was","are","were","be"}
        clean = [w.lower().strip('.,!?;:"\'()[]') for w in words]
        freq = Counter(w for w in clean if w and w not in stopwords and len(w) > 2)
        return {"success": True, "action": "keywords",
                "keywords": [{"word": w, "count": c, "frequency": round(c/len(words)*100, 2)} for w, c in freq.most_common(30)]}

    elif action == "pos_tags":
        nlp = load_spacy()
        if not nlp: error_out("spaCy not available")
        doc = nlp(text[:5000])
        tokens = [{"text": t.text, "pos": t.pos_, "tag": t.tag_, "dep": t.dep_, "lemma": t.lemma_, "is_stop": t.is_stop}
                  for t in doc if not t.is_space]
        pos_counts = Counter(t["pos"] for t in tokens)
        return {"success": True, "action": "pos_tags", "tokens": tokens[:200], "pos_distribution": dict(pos_counts)}

    else:
        error_out(f"Unknown action: {action}. Use: analyze, entities, keywords, pos_tags")

if __name__ == "__main__":
    import spacy
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON")
    print(json.dumps(process(spec)))
