"""buscador de texto completo

Revision ID: 0010
Revises: 0009
Create Date: 2026-10-20 11:40:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from app.services.text_extraction import extract_text


revision: str = '0010'
down_revision: str | None = '0009'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

UPDATE_SEARCH_VECTOR = """
    UPDATE documents AS d SET search_vector =
        setweight(to_tsvector('es_unaccent', d.title), 'A')
        || setweight(to_tsvector('es_unaccent', coalesce((
            SELECT string_agg(t.name, ' ') FROM tags AS t
            JOIN document_tags AS dt ON dt.tag_id = t.id
            WHERE dt.document_id = d.id), '')), 'A')
        || setweight(to_tsvector('es_unaccent', coalesce(d.content_text, '')), 'C')
"""


def upgrade() -> None:
    # Español sin tildes: "perdon" encuentra "perdón" y "perdonar"
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")
    op.execute("CREATE TEXT SEARCH CONFIGURATION es_unaccent (COPY = spanish)")
    op.execute(
        "ALTER TEXT SEARCH CONFIGURATION es_unaccent "
        "ALTER MAPPING FOR hword, hword_part, word WITH unaccent, spanish_stem"
    )
    op.add_column('documents', sa.Column('content_text', sa.Text(), nullable=True))
    op.add_column('documents', sa.Column('search_vector', postgresql.TSVECTOR(), nullable=True))
    op.create_index('ix_documents_search_vector', 'documents', ['search_vector'], unique=False, postgresql_using='gin')

    # Indexa los documentos que ya estaban en la biblioteca
    conn = op.get_bind()
    rows = conn.execute(sa.text(
        "SELECT d.id, d.mime_type, f.content FROM documents AS d "
        "JOIN document_files AS f ON f.document_id = d.id"
    ))
    for document_id, mime_type, content in rows.all():
        conn.execute(
            sa.text("UPDATE documents SET content_text = :text WHERE id = :id"),
            {"text": extract_text(content, mime_type), "id": document_id},
        )
    conn.execute(sa.text(UPDATE_SEARCH_VECTOR))


def downgrade() -> None:
    op.drop_index('ix_documents_search_vector', table_name='documents', postgresql_using='gin')
    op.drop_column('documents', 'search_vector')
    op.drop_column('documents', 'content_text')
    op.execute("DROP TEXT SEARCH CONFIGURATION es_unaccent")
    op.execute("DROP EXTENSION IF EXISTS unaccent")
