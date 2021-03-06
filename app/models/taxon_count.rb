# NOTE: Validations here are typically skipped because of update_all in results
# loader.
class TaxonCount < ApplicationRecord
  belongs_to :pipeline_run
  # NOTE: currently optional because some tests assume non-existant taxa
  belongs_to :taxon_lineage, class_name: "TaxonLineage", foreign_key: :tax_id, primary_key: :taxid, optional: true

  TAX_LEVEL_SPECIES = 1
  TAX_LEVEL_GENUS = 2
  TAX_LEVEL_FAMILY = 3
  TAX_LEVEL_ORDER = 4
  TAX_LEVEL_CLASS = 5
  TAX_LEVEL_PHYLUM = 6
  TAX_LEVEL_KINGDOM = 7
  TAX_LEVEL_SUPERKINGDOM = 8
  validates :tax_level, presence: true, inclusion: { in: [
    TAX_LEVEL_SPECIES,
    TAX_LEVEL_GENUS,
    TAX_LEVEL_FAMILY,
    TAX_LEVEL_ORDER,
    TAX_LEVEL_CLASS,
    TAX_LEVEL_PHYLUM,
    TAX_LEVEL_KINGDOM,
    TAX_LEVEL_SUPERKINGDOM,
  ] }, if: :mass_validation_enabled?

  COUNT_TYPE_NT = 'NT'.freeze
  COUNT_TYPE_NR = 'NR'.freeze
  # Single classifier that can either get results from NT, NR or both
  COUNT_TYPE_MERGED = 'merged_NT_NR'.freeze
  # Used to specify that source_count_type (for merged type) is both NT and NR
  COUNT_TYPE_NT_NR = 'NT-NR'.freeze
  validates :count_type, presence: true, inclusion: { in: [
    COUNT_TYPE_NT,
    COUNT_TYPE_NR,
    COUNT_TYPE_MERGED,
  ] }, if: :mass_validation_enabled?

  validates :source_count_type, allow_nil: true, inclusion: { in: [
    COUNT_TYPE_NT,
    COUNT_TYPE_NR,
    COUNT_TYPE_NT_NR,
  ] }

  # NOTE: some existing rspec tests assume a value of zero
  validates :count, numericality: { greater_than_or_equal_to: 0 }, if: :mass_validation_enabled?
  validates :percent_identity, inclusion: 0..100, if: :mass_validation_enabled?
  # NOTE: some existing rspec tests assume a value of zero
  validates :alignment_length, numericality: { greater_than_or_equal_to: 0 }, if: :mass_validation_enabled?
  validates :e_value, presence: true, if: :mass_validation_enabled?

  NAME_2_LEVEL = { 'species' => TAX_LEVEL_SPECIES,
                   'genus' => TAX_LEVEL_GENUS,
                   'family' => TAX_LEVEL_FAMILY,
                   'order' => TAX_LEVEL_ORDER,
                   'class' => TAX_LEVEL_CLASS,
                   'phylum' => TAX_LEVEL_PHYLUM,
                   'kingdom' => TAX_LEVEL_KINGDOM,
                   'superkingdom' => TAX_LEVEL_SUPERKINGDOM, }.freeze
  LEVEL_2_NAME = NAME_2_LEVEL.invert

  scope :type, ->(count_type) { where(count_type: count_type) }
  scope :level, ->(tax_level) { where(tax_level: tax_level) }
end
