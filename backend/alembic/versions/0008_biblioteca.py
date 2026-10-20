"""biblioteca: documentos, ficheros y etiquetas

Revision ID: 0008
Revises: 0007
Create Date: 2026-10-20 10:27:10.102383

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0008'
down_revision: str | None = '0007'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('tags',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('slug', sa.String(length=50), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_tags')),
    sa.UniqueConstraint('slug', name=op.f('uq_tags_slug'))
    )
    op.create_table('documents',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('school_year', sa.String(length=9), nullable=False),
    sa.Column('group_id', sa.Integer(), nullable=True),
    sa.Column('group_name', sa.String(length=80), nullable=False),
    sa.Column('filename', sa.String(length=255), nullable=False),
    sa.Column('mime_type', sa.String(length=100), nullable=False),
    sa.Column('size', sa.Integer(), nullable=False),
    sa.Column('drive_file_id', sa.String(length=100), nullable=True),
    sa.Column('created_by_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], name=op.f('fk_documents_created_by_id_users'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], name=op.f('fk_documents_group_id_groups'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_documents'))
    )
    op.create_index(op.f('ix_documents_group_name'), 'documents', ['group_name'], unique=False)
    op.create_index(op.f('ix_documents_school_year'), 'documents', ['school_year'], unique=False)
    op.create_table('document_files',
    sa.Column('document_id', sa.Integer(), nullable=False),
    sa.Column('content', sa.LargeBinary(), nullable=False),
    sa.ForeignKeyConstraint(['document_id'], ['documents.id'], name=op.f('fk_document_files_document_id_documents'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('document_id', name=op.f('pk_document_files'))
    )
    op.create_table('document_tags',
    sa.Column('document_id', sa.Integer(), nullable=False),
    sa.Column('tag_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['document_id'], ['documents.id'], name=op.f('fk_document_tags_document_id_documents'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], name=op.f('fk_document_tags_tag_id_tags'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('document_id', 'tag_id', name=op.f('pk_document_tags'))
    )
    op.create_index(op.f('ix_document_tags_tag_id'), 'document_tags', ['tag_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_document_tags_tag_id'), table_name='document_tags')
    op.drop_table('document_tags')
    op.drop_table('document_files')
    op.drop_index(op.f('ix_documents_school_year'), table_name='documents')
    op.drop_index(op.f('ix_documents_group_name'), table_name='documents')
    op.drop_table('documents')
    op.drop_table('tags')
