require 'open3'
require 'shellwords'

module PipelineRunsHelper
  STEP_DESCRIPTIONS = {
    PipelineRunStage::HOST_FILTERING_STAGE_NAME => {
      "stage" => "Filter out host reads and conduct quality control.",
      "steps" => {
        "validate_input_out" => "Validates the input files and truncates to max fragments.",
        "star_out" => "Remove host reads using STAR.",
        "trimmomatic_out" => "Trim Illumina adapters using trimmomatic.",
        "priceseq_out" => "Remove low-quality reads using PriceSeqFilter.",
        "cdhitdup_out" => "Remove duplicate reads using CD-HIT-DUP.",
        "lzw_out" => "Remove low-complexity reads using LZW compression filter.",
        "bowtie2_out" => "Remove remaining host reads using Bowtie2.",
        "star_human_out" => "Remove human reads using STAR.",
        "bowtie2_human_out" => "Remove residual human reads using Bowtie2.",
        "subsampled_out" => "Subsample if there are too many remaining reads.",
        "gsnap_filter_out" => "Remove residual human reads using GSNAP.",
      },
    },
    PipelineRunStage::ALIGNMENT_STAGE_NAME => {
      "stage" => "Align reads to NCBI nucleotide and protein databases.",
      "steps" => {
        "gsnap_out" => "Align remaining reads to the NCBI NT database using GSNAP.",
        "rapsearch2_out" => "Align remaining reads to the NCBI NR database using RAPSearch2.",
        "taxon_count_out" => "Count preliminary taxon hits.",
        "annotated_out" => "Annotate non-host FASTA with preliminary NCBI accession IDs.",
      },
    },
    PipelineRunStage::POSTPROCESS_STAGE_NAME => {
      "stage" => "Assemble reads and refine read assignments.",
      "steps" => {
        "taxid_fasta_out" => "Annotate non-host FASTA with preliminary Taxonomy IDs.",
        "taxid_locator_out" => "Sort preliminary annotated FASTA by Taxonomy IDs and store the byte range of each Taxonomy ID in a JSON.",
        "alignment_viz_out" => "Record number of unique accessions matched.",
        "assembly_out" => "Assemble non-host reads using SPAdes.",
        "coverage_out" => "Calculate coverage statistics for assembled contigs",
        "gsnap_accessions_out" => "Generate FASTA of candidate references matched during GSNAP / NT alignment.",
        "rapsearch2_accessions_out" => "Generate FASTA of candidate references matched during RAPSearch2 / NR alignment.",
        "refined_gsnap_out" => "BLAST assembled contigs against candidate references from NT; reassign corresponding reads to the matched taxon.",
        "refined_rapsearch2_out" => "BLAST assembled contigs against candidate references from NR; reassign corresponding reads to the matched taxon.",
        "refined_taxon_count_out" => "Count taxon hits after the reassignment based on the BLAST results.",
        "contig_summary_out" => "Record statistics on the assembled contigs.",
        "refined_annotated_out" => "Annotate non-host FASTA with NCBI accession IDs after the BLAST-based match refinement.",
        "refined_taxid_locator_out" => "Annotate non-host FASTA with revised Taxonomy IDs after the BLAST-based match refinement.",
      },
    },
    PipelineRunStage::EXPT_STAGE_NAME => {
      "stage" => "Generate additional experimental output.",
      "steps" => {
        "nonhost_fastq_out" => "Filter original fastq/fasta input files to only contain non-host reads processed by IdSeq.",
      },
    },
  }.freeze

  def aegea_batch_submit_command(base_command,
                                 memory: Sample::DEFAULT_MEMORY_IN_MB,
                                 vcpus: Sample::DEFAULT_VCPUS,
                                 job_queue: Sample::DEFAULT_QUEUE,
                                 docker_image: "idseq_dag")
    command = "aegea batch submit --command=#{Shellwords.escape(base_command)} "
    command += " --storage /mnt=#{Sample::DEFAULT_STORAGE_IN_GB} --volume-type gp2 --ecr-image #{Shellwords.escape(docker_image)} --memory #{memory} --queue #{Shellwords.escape(job_queue)} --vcpus #{vcpus} --job-role idseq-pipeline "
    command
  end

  def job_info(job_id, run_id)
    job_status = nil
    job_log_id = nil
    job_hash = nil
    stdout, stderr, status = Open3.capture3("aegea", "batch", "describe", job_id.to_s)
    if status.exitstatus.zero?
      job_description = stdout
      job_hash = JSON.parse(job_description)
      job_status = job_hash['status']
      if job_hash['container'] && job_hash['container']['logStreamName']
        job_log_id = job_hash['container']['logStreamName']
      end
    else
      LogUtil.log_err_and_airbrake("Error for update job status for record #{run_id} with error #{stderr}")
      job_status = PipelineRunStage::STATUS_ERROR # transient error, job is still "in progress"
      job_status = PipelineRunStage::STATUS_FAILED if stderr =~ /IndexError/ # job no longer exists
    end
    [job_status, job_log_id, job_hash, stdout]
  end

  def file_generated_since_run(record, s3_path)
    stdout, _stderr, status = Open3.capture3("aws", "s3", "ls", s3_path.to_s)
    return false unless status.exitstatus.zero?
    begin
      s3_file_time = DateTime.strptime(stdout[0..18], "%Y-%m-%d %H:%M:%S")
      return (s3_file_time && record.created_at && s3_file_time > record.created_at)
    rescue
      return nil
    end
  end

  def update_pipeline_version(record, version_column, s3_version_file)
    if record[version_column].blank? && file_generated_since_run(record, s3_version_file)
      record[version_column] = fetch_pipeline_version(s3_version_file)
      record.save
    end
  end

  def fetch_pipeline_version(s3_file = pipeline_version_file)
    stdout = Syscall.run("aws", "s3", "cp", s3_file, "-")
    return nil if stdout.blank?
    whole_version = stdout.strip
    whole_version =~ /(^\d+\.\d+).*/
    Regexp.last_match(1)
  end

  def upload_dag_json_and_return_job_command(dag_json, dag_s3, dag_name, key_s3_params = nil, copy_done_file = "")
    # Upload dag json
    Syscall.pipe_with_output(["echo", dag_json], ["aws", "s3", "cp", "-", dag_s3])

    # Generate job command
    dag_path_on_worker = "/mnt/#{dag_name}.json"
    download_dag = "aws s3 cp #{dag_s3} #{dag_path_on_worker}"
    execute_dag = "idseq_dag #{key_s3_params} #{dag_path_on_worker}"
    [download_dag, execute_dag, copy_done_file].join(";")
  end

  def install_pipeline(commit_or_branch)
    "pip install --upgrade git+git://github.com/chanzuckerberg/s3mi.git; " \
    "cd /mnt; " \
    "git clone https://github.com/chanzuckerberg/idseq-dag.git; " \
    "cd idseq-dag; " \
    "git checkout #{Shellwords.escape(commit_or_branch)}; " \
    "pip3 install -e . --upgrade"
  end

  def upload_version(s3_file)
    "idseq_dag --version | cut -f2 -d ' ' | aws s3 cp  - #{Shellwords.escape(s3_file)}"
  end

  def download_to_filename?(s3_file, local_file)
    # downloads file and returns whether it was successful
    Open3.capture3("aws", "s3", "cp", s3_file, local_file)[2].success?
  end

  def exists_in_s3?(s3_path)
    Open3.capture3("aws", "s3", "ls", s3_path)[2].success?
  end

  PIPELINE_VERSION_2 = '2.0'.freeze
  ASSEMBLY_PIPELINE_VERSION = '3.1'.freeze
  COVERAGE_VIZ_PIPELINE_VERSION = '3.6'.freeze

  def pipeline_version_at_least(pipeline_version, test_version)
    unless pipeline_version
      return false
    end

    pipeline_nums = pipeline_version.split(".")
    test_nums = test_version.split(".")

    # nil.to_i = 0, so we don't need to special-case versions like 3 and 3.1.
    if pipeline_nums[0].to_i > test_nums[0].to_i
      return true
    elsif pipeline_nums[0].to_i == test_nums[0].to_i
      if pipeline_nums[1].to_i > test_nums[1].to_i
        return true
      elsif pipeline_nums[1].to_i == test_nums[1].to_i
        if pipeline_nums[2].to_i >= test_nums[2].to_i
          return true
        end
      end
    end

    return false
  end

  def pipeline_version_has_assembly(pipeline_version)
    pipeline_version_at_least(pipeline_version, ASSEMBLY_PIPELINE_VERSION)
  end

  def pipeline_version_has_coverage_viz(pipeline_version)
    pipeline_version_at_least(pipeline_version, COVERAGE_VIZ_PIPELINE_VERSION)
  end

  def pipeline_version_at_least_2(pipeline_version)
    pipeline_version_at_least(pipeline_version, PIPELINE_VERSION_2)
  end

  def get_key_from_s3_json(s3_file, key)
    file = Tempfile.new
    downloaded = PipelineRun.download_file_with_retries(s3_file, file.path, 3, false)
    value = downloaded ? JSON.parse(File.read(file))[key] : nil
    file.unlink
    value
  end

  def check_for_user_error(failed_stage)
    return [nil, nil] unless [1, 2].include? failed_stage.step_number
    # We need to set the pipeline version in the failed pipeline run so that the host_filter_output_s3_path includes it,
    # i.e. "/results/3.7" instead of "/results"
    # The pipeline version is usually set in the result monitor, but that is not guaranteed to have run by this point.
    if failed_stage.pipeline_run.pipeline_version.blank?
      update_pipeline_version(
        failed_stage.pipeline_run, :pipeline_version, failed_stage.pipeline_run.pipeline_version_file
      )
    end
    user_input_validation_file = "#{failed_stage.pipeline_run.host_filter_output_s3_path}/#{PipelineRun::INPUT_VALIDATION_NAME}"
    invalid_step_input_file = "#{failed_stage.pipeline_run.host_filter_output_s3_path}/#{PipelineRun::INVALID_STEP_NAME}"
    if file_generated_since_run(failed_stage, user_input_validation_file)
      # Case where validation of user input format fails.
      # The code that produces user_input_validation_file lives here:
      # https://github.com/chanzuckerberg/idseq-dag/blob/3feaa36d85bd1c4626b363f393699c8d4c4c274c/idseq_dag/steps/run_validate_input.py#L59
      validation_error = get_key_from_s3_json(user_input_validation_file, "Validation error")
      return ["FAULTY_INPUT", validation_error] if validation_error
    end
    if file_generated_since_run(failed_stage, invalid_step_input_file)
      # Case where an intermediate output does not meet the requirements for the next step's inputs.
      # Possible error codes defined here: https://github.com/chanzuckerberg/idseq-dag/blob/861e4d9f1382315ae16971c6985b31f08feca501/idseq_dag/engine/pipeline_step.py#L21
      error_code = get_key_from_s3_json(invalid_step_input_file, "error")
      return [error_code, nil]
    end
    [nil, nil]
  end
end
