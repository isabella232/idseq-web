require 'rails_helper'
require 'json'

RSpec.describe SfnCGPipelineDispatchService, type: :service do
  let(:fake_samples_bucket) { "fake-samples-bucket" }
  let(:s3_samples_key_prefix) { "samples/%<project_id>s/%<sample_id>s" }
  let(:s3_sample_input_files_path) { "s3://#{fake_samples_bucket}/#{s3_samples_key_prefix}/fastqs/%<input_file_name>s" }
  let(:sfn_name) { "idseq-test-%<project_id>s-%<sample_id>s-cg-%<time>s" }
  let(:fake_account_id) { "123456789012" }
  let(:fake_samples_bucket) { "fake-samples-bucket" }
  let(:fake_sfn_arn) { "fake:sfn:arn" }
  let(:fake_sfn_execution_arn) { "fake:sfn:execution:arn" }
  let(:test_workflow_name) { WorkflowRun::WORKFLOW[:consensus_genome] }
  let(:fake_wdl_version) { "10.0.0" }
  let(:fake_states_client) do
    Aws::States::Client.new(
      stub_responses: {
        start_execution: {
          execution_arn: fake_sfn_execution_arn,
          start_date: Time.zone.now,
        },
        list_tags_for_resource: {
          tags: [
            { key: "wdl_version", value: fake_wdl_version },
          ],
        },
      }
    )
  end
  let(:fake_sts_client) do
    Aws::STS::Client.new(
      stub_responses: {
        get_caller_identity: {
          account: fake_account_id,
        },
      }
    )
  end

  let(:project) { create(:project) }
  let(:sample) do
    create(:sample,
           project: project,
           temp_pipeline_workflow: test_workflow_name)
  end
  let(:workflow_run) do
    create(:workflow_run,
           workflow: test_workflow_name,
           status: WorkflowRun::STATUS[:created],
           sample: sample,
           inputs_json: { wetlab_protocol: ConsensusGenomeWorkflowRun::WETLAB_PROTOCOL[:msspe] }.to_json)
  end

  describe "#call" do
    subject do
      SfnCGPipelineDispatchService.call(workflow_run)
    end

    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('SAMPLES_BUCKET_NAME').and_return(fake_samples_bucket)

      create(:app_config, key: AppConfig::SFN_CG_ARN, value: fake_sfn_arn)

      Aws.config[:stub_responses] = true
      @mock_aws_clients = {
        states: fake_states_client,
        sts: fake_sts_client,
      }

      allow(AwsClient).to receive(:[]) { |client|
        @mock_aws_clients[client]
      }
    end

    context "when workflow has no version" do
      it "returns an exception" do
        @mock_aws_clients[:states].stub_responses(:list_tags_for_resource, tags: [])
        expect { subject }.to raise_error(SfnCGPipelineDispatchService::SfnVersionMissingError, /WDL version for '#{test_workflow_name}' not set/)
      end
    end

    context "with workflow version" do
      before do
        create(:app_config, key: format(AppConfig::WORKFLOW_VERSION_TEMPLATE, workflow_name: test_workflow_name), value: fake_wdl_version)
      end

      it "returns correct json" do
        expect(subject).to include_json({})
      end

      it "returns sfn input containing fastq input files" do
        expect(subject).to include_json(
          sfn_input_json: {
            Input: {
              Run: {
                fastqs_0: format(s3_sample_input_files_path, sample_id: sample.id, project_id: project.id, input_file_name: sample.input_files[0].source),
                fastqs_1: format(s3_sample_input_files_path, sample_id: sample.id, project_id: project.id, input_file_name: sample.input_files[1].source),
              },
            },
          }
        )
      end

      it "returns sfn input containing correct default sfn parameters" do
        expect(subject).to include_json(
          sfn_input_json: {
            Input: {
              Run: {
                docker_image_id: "#{fake_account_id}.dkr.ecr.us-west-2.amazonaws.com/idseq-consensus-genome:v#{fake_wdl_version}",
                sample: sample.name,
                ref_fasta: "s3://#{S3_DATABASE_BUCKET}/consensus-genome/MN908947.3.fa",
                ref_host: "s3://#{S3_DATABASE_BUCKET}/consensus-genome/hg38.fa.gz",
                kraken2_db_tar_gz: "s3://#{S3_DATABASE_BUCKET}/consensus-genome/kraken_coronavirus_db_only.tar.gz",
                primer_bed: "s3://#{S3_DATABASE_BUCKET}/consensus-genome/msspe_primers.bed",
                ercc_fasta: "s3://#{S3_DATABASE_BUCKET}/consensus-genome/ercc_sequences.fasta",
              },
            },
          }
        )
      end

      it "returns sfn input containing wdl workflow" do
        expect(subject).to include_json(
          sfn_input_json: {
            RUN_WDL_URI: "s3://#{S3_WORKFLOWS_BUCKET}/#{workflow_run.workflow_version_tag}/run.wdl",
          }
        )
      end

      it "kicks off the CG run and updates the WorkflowRun as expected" do
        subject
        expect(workflow_run).to have_attributes(sfn_execution_arn: fake_sfn_execution_arn, status: WorkflowRun::STATUS[:running])
      end

      context "when start-execution or dispatch fails" do
        it "raises original exception" do
          @mock_aws_clients[:states].stub_responses(:start_execution, Aws::States::Errors::InvalidArn.new(nil, nil))
          expect { subject }.to raise_error(Aws::States::Errors::InvalidArn)
          expect(workflow_run).to have_attributes(sfn_execution_arn: nil, status: WorkflowRun::STATUS[:failed])
        end
      end

      context "when artic wetlab protocol is chosen" do
        let(:workflow_run) do
          create(:workflow_run,
                 workflow: test_workflow_name,
                 status: WorkflowRun::STATUS[:created],
                 sample: sample,
                 inputs_json: { wetlab_protocol: ConsensusGenomeWorkflowRun::WETLAB_PROTOCOL[:artic] }.to_json)
        end
        it "returns sfn input with artic primer" do
          expect(subject).to include_json(
            sfn_input_json: {
              Input: {
                Run: {
                  primer_bed: "s3://#{S3_DATABASE_BUCKET}/consensus-genome/artic_v3_primers.bed",
                },
              },
            }
          )
        end
      end

      context "when SNAP wetlab protocol is chosen" do
        let(:workflow_run) do
          create(:workflow_run,
                 workflow: test_workflow_name,
                 status: WorkflowRun::STATUS[:created],
                 sample: sample,
                 inputs_json: { wetlab_protocol: ConsensusGenomeWorkflowRun::WETLAB_PROTOCOL[:snap] }.to_json)
        end
        it "returns sfn input with SNAP primer" do
          expect(subject).to include_json(
            sfn_input_json: {
              Input: {
                Run: {
                  primer_bed: "s3://#{S3_DATABASE_BUCKET}/consensus-genome/snap_primers.bed",
                },
              },
            }
          )
        end
      end

      context "when no wetlab protocol is supplied" do
        let(:workflow_run) do
          create(:workflow_run,
                 workflow: test_workflow_name,
                 status: WorkflowRun::STATUS[:created],
                 sample: sample)
        end
        it "throws an error" do
          expect { subject }.to raise_error(SfnCGPipelineDispatchService::WetlabProtocolMissingError)
        end
      end
    end
  end
end
