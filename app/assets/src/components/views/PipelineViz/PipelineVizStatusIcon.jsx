import PropTypes from "prop-types";
import React from "react";
import cx from "classnames";

import InfoCircleIcon from "~/components/ui/icons/InfoCircleIcon";
import { IconLoading, IconSuccessSmall } from "~ui/icons";

import cs from "./pipeline_viz.scss";

const PipelineVizStatusIcon = ({ type, className }) => {
  switch (type) {
    case "inProgress":
      return <IconLoading className={cx(className, cs.inProgressIcon)} />;
    case "finished":
      return <IconSuccessSmall className={cx(className, cs.finishedIcon)} />;
    case "pipelineErrored":
      return (
        <InfoCircleIcon className={cx(className, cs.pipelineErroredIcon)} />
      );
    case "userErrored":
      return <InfoCircleIcon className={cx(className, cs.userErroredIcon)} />;
    default:
      return null;
  }
};

PipelineVizStatusIcon.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
};

export default PipelineVizStatusIcon;
