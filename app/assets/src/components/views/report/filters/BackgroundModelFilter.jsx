import React from "react";

import PropTypes from "../../../utils/propTypes";
import SubtextDropdown from "~ui/controls/dropdowns/SubtextDropdown";

class BackgroundModelFilter extends React.Component {
  render() {
    const {
      allBackgrounds,
      enableMassNormalizedBackgrounds,
      onChange,
      value,
    } = this.props;
    let disabled = !!this.props.disabled || false;
    let backgroundOptions = allBackgrounds.map(background => {
      const disabledOption =
        !enableMassNormalizedBackgrounds && background.mass_normalized;
      return {
        text: background.name || background.text,
        subtext: background.mass_normalized
          ? "Normalized by input mass"
          : "Standard",
        value: background.id || background.value,
        disabled: disabledOption,
        tooltip: disabledOption
          ? "Only for ERCC samples run on Pipeline v4.0 or later"
          : null,
      };
    });
    if (backgroundOptions.length === 0) {
      backgroundOptions = [
        { text: "No background models to display", value: -1 },
      ];
      disabled = true;
    }
    return (
      <SubtextDropdown
        {...this.props}
        options={backgroundOptions}
        initialSelectedValue={value}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
}

BackgroundModelFilter.defaultProps = {
  rounded: true,
  label: "Background",
};

BackgroundModelFilter.propTypes = {
  allBackgrounds: PropTypes.arrayOf(PropTypes.BackgroundData),
  disabled: PropTypes.bool,
  enableMassNormalizedBackgrounds: PropTypes.bool,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rounded: PropTypes.bool,
  selectedInvalidBackground: PropTypes.bool,
  value: PropTypes.number,
};

export default BackgroundModelFilter;
