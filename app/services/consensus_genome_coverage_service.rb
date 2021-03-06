class ConsensusGenomeCoverageService
  include Callable

  # Maximum number of bins (will be used)
  MAX_NUM_BINS = 500

  class NoDepthDataError < StandardError
    def initialize(workflow_run)
      super("No depth data available for workflow_run #{workflow_run.id}.")
    end
  end

  def initialize(
    workflow_run:,
    max_num_bins: MAX_NUM_BINS,
    cacheable_only: false
  )
    @workflow_run = workflow_run
    @max_num_bins = max_num_bins
    # cacheable_only will return cache-friendly data (e.g. basic stats)
    # Included: coverage_breadth, coverage_depth, max_aligned_length, total_length
    # Excluded: coverage, coverage_bin_size
    @cacheable_only = cacheable_only
  end

  def call
    return generate_coverage_viz
  end

  private

  def generate_coverage_viz
    depths = fetch_depths_data
    return convert_to_coverage_data(depths)
  end

  def fetch_depths_data
    depths = @workflow_run.output(ConsensusGenomeWorkflowRun::OUTPUT_DEPTHS)
    raise NoDepthDataError, @workflow_run unless depths

    depths = depths.split(/\n+/).map(&:to_i)
    return depths
  end

  def convert_to_coverage_data(depths)
    coverage_breadth = depths.count { |d| d > 0 }.to_f / depths.size
    coverage_depth = depths.select { |d| d > 0 }.sum(0.0) / depths.size
    max_aligned_length = depths.size
    total_length = depths.size

    if @cacheable_only
      return {
        coverage_breadth: coverage_breadth,
        coverage_depth: coverage_depth,
        max_aligned_length: max_aligned_length,
        total_length: total_length,
      }
    end

    # takes the histogram from depths file and converts to coverage viz data format
    if depths.size <= @max_num_bins
      num_bins = depths.size
      bin_size = 1
    else
      num_bins = @max_num_bins
      bin_size = depths.size.to_f / @max_num_bins
    end

    coverage = (0...num_bins).map do |idx|
      bin_start = idx * bin_size
      start_fraction = 1 - bin_start.modulo(1)
      idx_start = bin_start.floor
      bin_end = (idx + 1) * bin_size
      end_fraction = bin_end.modulo(1)
      idx_end = bin_end.ceil - 1

      # compute average depth accounting for partial start and end fraction
      depth_arr = depths[idx_start..idx_end]

      weights = Array.new(depth_arr.size, 1.0)
      weights[0] = start_fraction
      # set end fraction only if we loaded the last cell
      weights[weights.size - 1] = end_fraction if end_fraction > 0
      avg_depth = depth_arr.zip(weights).map { |x, y| x * y }.sum(0.0) / (bin_end - bin_start)

      breadth_arr = depths[idx_start..idx_end].map { |v| v > 0 ? 1 : 0 }
      avg_breadth = breadth_arr.zip(weights).map { |x, y| x * y }.sum(0.0) / (bin_end - bin_start)
      [
        idx, # bin index
        avg_depth.round(3),
        avg_breadth.round(3),
        # set number of contigs to 1 because we consider one posisble contig that aligns to the reference
        1,
        # TODO(tiago): review this stat (number of reads): should it be the same as depth?
        0,
      ]
    end

    return {
      total_length: total_length,
      coverage: coverage,
      coverage_bin_size: bin_size,
      # TODO: fix to match longer alignment
      max_aligned_length: max_aligned_length,
      coverage_depth: coverage_depth,
      coverage_breadth: coverage_breadth,
    }
  end
end
