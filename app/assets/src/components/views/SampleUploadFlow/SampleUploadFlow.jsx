import React from "react";
import cx from "classnames";
import { get, without, flow, omit, set, find } from "lodash/fp";

import UploadSampleStep from "./UploadSampleStep";
import NarrowContainer from "~/components/layout/NarrowContainer";
import PropTypes from "~/components/utils/propTypes";

import UploadMetadataStep from "./UploadMetadataStep";
import ReviewStep from "./ReviewStep";
import cs from "./sample_upload_flow.scss";
import SampleUploadFlowHeader from "./SampleUploadFlowHeader";

// See HOST_GENOME_SYNONYMS in MetadataField
const HOST_GENOME_SYNONYMS = [
  "host_genome",
  "Host Genome",
  "host_organism",
  "Host Organism",
];

class SampleUploadFlow extends React.Component {
  state = {
    currentStep: "uploadSamples",
    // Sample upload information
    samples: null,
    uploadType: "", // remote or local
    project: null,
    sampleNamesToFiles: null, // Needed for local samples.
    // Metadata upload information
    metadata: null, //
    metadataIssues: null,
    stepsEnabled: {
      uploadSamples: true,
      uploadMetadata: false,
      review: false,
    },
    hostGenomes: [], // set on metadata upload
    workflows: new Set(),
    wetlabProtocol: null,
  };

  componentDidMount() {
    // Latest browsers will only show a generic warning
    window.onbeforeunload = () =>
      "Are you sure you want to leave? All data will be lost.";
  }

  onUploadComplete = () => {
    window.onbeforeunload = null;
  };

  handleUploadSamples = ({
    samples,
    project,
    uploadType,
    sampleNamesToFiles,
    workflows,
    wetlabProtocol,
  }) => {
    this.setState({
      currentStep: "uploadMetadata",
      project,
      sampleNamesToFiles,
      samples,
      stepsEnabled: set("uploadMetadata", true, this.state.stepsEnabled),
      uploadType,
      wetlabProtocol,
      workflows,
    });
  };

  handleUploadMetadata = ({ metadata, issues, newHostGenomes }) => {
    const updatedHostGenomes = this.props.hostGenomes.concat(newHostGenomes);

    // Populate host_genome_id in sample using metadata.
    const newSamples = this.state.samples.map(sample => {
      const metadataRow = find(
        row =>
          get("sample_name", row) === sample.name ||
          get("Sample Name", row) === sample.name,
        metadata.rows
      );
      const hostGenomeName = HOST_GENOME_SYNONYMS.reduce(
        (match, name) => metadataRow[name] || match,
        null
      );
      const hostGenomeId = find(
        // Lowercase to allow for 'human' to match 'Human'. The same logic
        // is replicated in MetadataHelper.
        hg => {
          return hg.name.toLowerCase() === hostGenomeName.toLowerCase();
        },
        updatedHostGenomes
      ).id;

      return {
        ...sample,
        // Set the host_genome_id and name so it is available in review
        host_genome_id: hostGenomeId,
        host_genome_name: hostGenomeName,
      };
    });

    // Remove host_genome from metadata.
    const newMetadata = flow(
      set("rows", metadata.rows.map(omit(HOST_GENOME_SYNONYMS))),
      set("headers", without(HOST_GENOME_SYNONYMS, metadata.headers))
    )(metadata);

    this.setState({
      samples: newSamples,
      metadata: newMetadata,
      metadataIssues: issues,
      currentStep: "review",
      stepsEnabled: set("review", true, this.state.stepsEnabled),
      hostGenomes: updatedHostGenomes,
    });
  };

  samplesChanged = () => {
    this.setState({
      stepsEnabled: {
        uploadSamples: true,
        uploadMetadata: false,
        review: false,
      },
    });
  };

  metadataChanged = () => {
    this.setState({
      stepsEnabled: {
        uploadSamples: true,
        uploadMetadata: true,
        review: false,
      },
    });
  };

  handleStepSelect = step => {
    this.setState({
      currentStep: step,
    });
  };

  // SLIGHT HACK: Keep steps mounted, so user can return to them if needed.
  // The internal state of some steps is difficult to recover if they are unmounted.
  renderSteps = () => {
    const { workflows, wetlabProtocol } = this.state;
    return (
      <div>
        <UploadSampleStep
          onDirty={this.samplesChanged}
          onUploadSamples={this.handleUploadSamples}
          visible={this.state.currentStep === "uploadSamples"}
          basespaceClientId={this.props.basespaceClientId}
          basespaceOauthRedirectUri={this.props.basespaceOauthRedirectUri}
          admin={this.props.admin}
          biohubS3UploadEnabled={this.props.biohubS3UploadEnabled}
        />
        {this.state.samples && (
          <UploadMetadataStep
            onUploadMetadata={this.handleUploadMetadata}
            samples={this.state.samples}
            project={this.state.project}
            visible={this.state.currentStep === "uploadMetadata"}
            onDirty={this.metadataChanged}
            workflows={workflows}
          />
        )}
        {this.state.samples && this.state.metadata && (
          <ReviewStep
            hostGenomes={this.state.hostGenomes}
            metadata={this.state.metadata}
            onStepSelect={this.handleStepSelect}
            onUploadComplete={this.onUploadComplete}
            onUploadStatusChange={this.onUploadStatusChange}
            originalHostGenomes={this.props.hostGenomes}
            project={this.state.project}
            sampleNamesToFiles={this.state.sampleNamesToFiles}
            samples={this.state.samples}
            uploadType={this.state.uploadType}
            visible={this.state.currentStep === "review"}
            wetlabProtocol={wetlabProtocol}
            workflows={workflows}
          />
        )}
      </div>
    );
  };

  onUploadStatusChange = uploadStatus => {
    this.setState({
      stepsEnabled: {
        uploadSamples: !uploadStatus,
        uploadMetadata: !uploadStatus,
        review: !uploadStatus,
      },
    });
  };

  render() {
    return (
      <div>
        <SampleUploadFlowHeader
          currentStep={this.state.currentStep}
          samples={this.state.samples}
          project={this.state.project}
          onStepSelect={this.handleStepSelect}
          stepsEnabled={this.state.stepsEnabled}
        />
        <NarrowContainer className={cx(cs.sampleUploadFlow)}>
          <div className={cs.inner}>{this.renderSteps()}</div>
        </NarrowContainer>
      </div>
    );
  }
}

SampleUploadFlow.propTypes = {
  csrf: PropTypes.string,
  hostGenomes: PropTypes.arrayOf(PropTypes.HostGenome),
  admin: PropTypes.bool,
  biohubS3UploadEnabled: PropTypes.bool,
  basespaceClientId: PropTypes.string.isRequired,
  basespaceOauthRedirectUri: PropTypes.string.isRequired,
};

export default SampleUploadFlow;
