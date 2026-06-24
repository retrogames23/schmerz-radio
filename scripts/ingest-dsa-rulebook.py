#!/usr/bin/env python3
"""
Ingest-Pipeline: DSA3-Grundregeln-PDF → pgvector (`dsa_rulebook_chunks`).

Voraussetzungen (Sandbox / lokale Ausführung mit psql-Zugang):
  - $LOVABLE_API_KEY (für Embedding-Calls über die Lovable AI Gateway)
  - $PGHOST/$PGUSER/$PGPASSWORD/$PGDATABASE/$PGPORT (Service-Role-Zugang)
  - `python -m pip install pypdf requests`

Aufruf:
  python scripts/ingest-dsa-rulebook.py <pfad/zur/regel.pdf> <source-id>

Beispiel:
  python scripts/ingest-dsa-rulebook.py ./dsa3-grundregeln.pdf dsa3-grundregeln

Idempotent: doppelte Chunks (gleicher content_hash) werden via
UNIQUE (source, content_hash) übersprungen.
"""

import os, sys, re, json, hashlib, time, subprocess, tempfile
import requests
from pypdf import PdfReader

MODEL = "openai/text-embedding-3-small"
CHUNK_TARGET = 900
CHUNK_OVERLAP = 180
BATCH = 64
GATEWAY = "https://ai.gateway.lovable.dev/v1/embeddings"

def chunk_pages(pages):
    chunks, buf, buf_start, idx = [], "", 1, 0
    for pi, txt in enumerate(pages, start=1):
        if not txt:
            continue
        if not buf:
            buf_start = pi
        buf += ("\n" if buf else "") + txt
        while len(buf) >= CHUNK_TARGET:
            cut = CHUNK_TARGET
            window = buf[: CHUNK_TARGET + 200]
            for sep in ["\n\n", "\n", ". ", "; ", " "]:
                j = window.rfind(sep, int(CHUNK_TARGET * 0.6))
                if j != -1:
                    cut = j + len(sep)
                    break
            piece = buf[:cut].strip()
            if piece:
                chunks.append({"content": piece, "page_start": buf_start, "page_end": pi, "chunk_index": idx})
                idx += 1
            tail = buf[max(0, cut - CHUNK_OVERLAP) : cut]
            buf = (tail + buf[cut:]).lstrip()
            buf_start = pi
    if buf.strip():
        chunks.append({"content": buf.strip(), "page_start": buf_start, "page_end": len(pages), "chunk_index": idx})
    return chunks

def embed_batch(api_key, texts):
    r = requests.post(
        GATEWAY,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": MODEL, "input": texts},
        timeout=120,
    )
    r.raise_for_status()
    return [d["embedding"] for d in r.json()["data"]]

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    pdf_path, source = sys.argv[1], sys.argv[2]
    api_key = os.environ["LOVABLE_API_KEY"]

    reader = PdfReader(pdf_path)
    pages = []
    for p in reader.pages:
        try:
            t = p.extract_text() or ""
        except Exception:
            t = ""
        t = re.sub(r"[ \t]+", " ", t)
        t = re.sub(r"\n{3,}", "\n\n", t).strip()
        pages.append(t)
    print(f"pages: {len(pages)}  chars: {sum(len(t) for t in pages)}")

    chunks = chunk_pages(pages)
    for c in chunks:
        c["hash"] = hashlib.sha256(c["content"].encode("utf-8")).hexdigest()
        c["tokens"] = len(c["content"]) // 4
    print(f"chunks: {len(chunks)}")

    embs = []
    for i in range(0, len(chunks), BATCH):
        batch = chunks[i : i + BATCH]
        embs.extend(embed_batch(api_key, [c["content"] for c in batch]))
        print(f"  embedded {i + len(batch)}/{len(chunks)}")
        time.sleep(0.3)

    # Staging via temp file + COPY into temp table + INSERT ... ON CONFLICT
    tsv = tempfile.NamedTemporaryFile("w", suffix=".tsv", delete=False)
    for c, e in zip(chunks, embs):
        vec = "[" + ",".join(f"{x:.7f}" for x in e) + "]"
        content = c["content"].replace("\\", "\\\\").replace("\t", " ").replace("\n", "\\n").replace("\r", "")
        meta = json.dumps({"chunk_index": c["chunk_index"]}).replace("\\", "\\\\").replace("\t", " ")
        tsv.write(f"{source}\t{c['page_start']}\t{c['page_end']}\t{c['chunk_index']}\t{content}\t{c['hash']}\t{c['tokens']}\t{vec}\t{meta}\n")
    tsv.close()

    sql = f"""
    CREATE TEMP TABLE _ingest (LIKE public.dsa_rulebook_chunks INCLUDING DEFAULTS);
    \\COPY _ingest(source,page_start,page_end,chunk_index,content,content_hash,token_estimate,embedding,metadata) FROM '{tsv.name}' WITH (FORMAT text, DELIMITER E'\\t');
    INSERT INTO public.dsa_rulebook_chunks (source,page_start,page_end,chunk_index,content,content_hash,token_estimate,embedding,metadata)
      SELECT source,page_start,page_end,chunk_index,content,content_hash,token_estimate,embedding,metadata FROM _ingest
      ON CONFLICT (source, content_hash) DO NOTHING;
    SELECT count(*) AS inserted FROM public.dsa_rulebook_chunks WHERE source = '{source}';
    """
    subprocess.run(["psql", "-v", "ON_ERROR_STOP=1", "-c", sql], check=True)
    os.unlink(tsv.name)
    print("done.")

if __name__ == "__main__":
    main()