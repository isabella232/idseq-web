import React from "react";
import PropTypes from "prop-types";
import cs from "./filters_icon.scss";

const FiltersIcon = props => {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 38 38"
    >
      <defs>
        <clipPath id="clip-path">
          <path
            className={cs.cls1}
            d="M-323.37-46.51a1.07,1.07,0,0,1,.85-.37h3.6a1.05,1.05,0,0,1,.85.37l1,1.17a3.26,3.26,0,0,0,2.54,1.22h12.61a1.13,1.13,0,0,1,.81.33,1.21,1.21,0,0,1,.29.84l-.07.55h-22.36l-.36-3.27A1.07,1.07,0,0,1-323.37-46.51Zm23,20.22A1.42,1.42,0,0,1-301.86-25h-20.81a1.43,1.43,0,0,1-1.47-1.32L-325.32-39a1.13,1.13,0,0,1,.3-.84,1,1,0,0,1,.81-.37h23.9a1,1,0,0,1,.81.37,1.13,1.13,0,0,1,.29.84Zm-27.1-12.5,1.14,12.72a3.68,3.68,0,0,0,3.68,3.31h20.81a3.67,3.67,0,0,0,3.68-3.31L-297-38.79a3.22,3.22,0,0,0-.85-2.54,3,3,0,0,0-.84-.66l.07-.74a3.27,3.27,0,0,0-.83-2.53,3.32,3.32,0,0,0-2.44-1.07h-12.61a1,1,0,0,1-.85-.4l-1-1.18a3.31,3.31,0,0,0-2.54-1.18h-3.6A3.13,3.13,0,0,0-325-48a3.24,3.24,0,0,0-.85,2.57l.37,3.27a3.32,3.32,0,0,0-1.18.81A3.29,3.29,0,0,0-327.49-38.79Z"
          />
        </clipPath>
        <clipPath id="clip-path-2">
          <circle className={cs.cls2} cx="-302.21" cy="-24.66" r="7.5" />
        </clipPath>
        <clipPath id="clip-path-3">
          <path
            className={cs.cls2}
            d="M-303.92-30.82a.11.11,0,0,1,.15.07,3.88,3.88,0,0,1,.25.5,1.47,1.47,0,0,1,.06,1.21c-.21.44-.71.63-1.12.85a5.78,5.78,0,0,0-2.09,1.87s-.07.1-.1.1a.11.11,0,0,1-.15-.07.74.74,0,0,1-.25-.21s-.13,0-.13.09a1,1,0,0,0,.47,1.12,1.62,1.62,0,0,1,.19.13c.12.16,0,.37,0,.56a.54.54,0,0,0,.62.38,3.15,3.15,0,0,0,.75-.25,1.87,1.87,0,0,1,1.69.22c.25.15.47.4.72.56a1.19,1.19,0,0,0,.75.25.28.28,0,0,1,.16.06.89.89,0,0,1-.16.78,7.17,7.17,0,0,1-.69.66c-.53.59-.65,1.5-1.09,2.15a1.55,1.55,0,0,0-.25.41,1.49,1.49,0,0,0-.06.66s0,.09-.07.06a1,1,0,0,1-.31-.13.2.2,0,0,1-.12-.15,8.66,8.66,0,0,0-.91-2.6,2.36,2.36,0,0,0-.69-.84c-.09-.06-.19-.12-.22-.22s0-.15,0-.22a2.37,2.37,0,0,0-1-2.22c-.12-.09-.25-.15-.31-.28s-.06-.31-.12-.43a1.8,1.8,0,0,0-.44-.38c-.06,0-.06-.09-.06-.16A6.37,6.37,0,0,1-303.92-30.82Zm3.15-.09c.28.06.56.16.85.25a1.41,1.41,0,0,0,.5.22,6.18,6.18,0,0,1,2.06,1.56.24.24,0,0,1,.06.16.91.91,0,0,1,0,.4.82.82,0,0,0-.06.25.37.37,0,0,0,.28.32,1.42,1.42,0,0,0,.37,0,.23.23,0,0,1,.22.15,2.09,2.09,0,0,0,.22.47,6.39,6.39,0,0,1,.47,2.16.45.45,0,0,1-.09.28,2.4,2.4,0,0,0-.35.47,6.16,6.16,0,0,1-.72,1.31,1.59,1.59,0,0,0-.4.59,3,3,0,0,0-.07.5c0,.07-.12.07-.18,0a3.57,3.57,0,0,1-.53-1.22c-.07-.32-.13-.63-.22-.94a1.27,1.27,0,0,0-.57-.75,2.56,2.56,0,0,0-1-.16,1.13,1.13,0,0,1-.93-.34.72.72,0,0,1-.16-.44,2,2,0,0,1,1-2.06c.09-.06.19-.09.28-.16a.63.63,0,0,0,.22-.65c0-.07-.09-.1-.12-.07a3.8,3.8,0,0,0-.54.22c-.09,0-.18,0-.15-.09a3.51,3.51,0,0,1,.12-.94,1.34,1.34,0,0,0,0-1,.25.25,0,0,0-.18-.12h-.88a0,0,0,0,1,0,0,2.3,2.3,0,0,0,.41-.35A.23.23,0,0,1-300.77-30.91Zm-.84-1.06a7.34,7.34,0,0,0-7.91,7.9,7.35,7.35,0,0,0,6.72,6.72,7.32,7.32,0,0,0,7.91-7.9A7.35,7.35,0,0,0-301.61-32Z"
          />
        </clipPath>
        <clipPath id="clip-path-4">
          <path
            className={cs.cls2}
            d="M-807.84-15.69a.68.68,0,0,0-.72.64.62.62,0,0,0,.37.56v.87a.33.33,0,0,0,.35.32.34.34,0,0,0,.35-.32v-.87a.64.64,0,0,0,.36-.56A.68.68,0,0,0-807.84-15.69Z"
          />
        </clipPath>
      </defs>
      <path
        className={cs.cls1}
        d="M-323.37-46.51a1.07,1.07,0,0,1,.85-.37h3.6a1.05,1.05,0,0,1,.85.37l1,1.17a3.26,3.26,0,0,0,2.54,1.22h12.61a1.13,1.13,0,0,1,.81.33,1.21,1.21,0,0,1,.29.84l-.07.55h-22.36l-.36-3.27A1.07,1.07,0,0,1-323.37-46.51Zm23,20.22A1.42,1.42,0,0,1-301.86-25h-20.81a1.43,1.43,0,0,1-1.47-1.32L-325.32-39a1.13,1.13,0,0,1,.3-.84,1,1,0,0,1,.81-.37h23.9a1,1,0,0,1,.81.37,1.13,1.13,0,0,1,.29.84Zm-27.1-12.5,1.14,12.72a3.68,3.68,0,0,0,3.68,3.31h20.81a3.67,3.67,0,0,0,3.68-3.31L-297-38.79a3.22,3.22,0,0,0-.85-2.54,3,3,0,0,0-.84-.66l.07-.74a3.27,3.27,0,0,0-.83-2.53,3.32,3.32,0,0,0-2.44-1.07h-12.61a1,1,0,0,1-.85-.4l-1-1.18a3.31,3.31,0,0,0-2.54-1.18h-3.6A3.13,3.13,0,0,0-325-48a3.24,3.24,0,0,0-.85,2.57l.37,3.27a3.32,3.32,0,0,0-1.18.81A3.29,3.29,0,0,0-327.49-38.79Z"
      />
      <g className={cs.cls3}>
        <rect
          className={cs.cls1}
          x="-518.71"
          y="-834.16"
          width="1478"
          height="1395"
        />
      </g>
      <path
        className={cs.cls7}
        d="M21,10.06H7A.95.95,0,1,0,7,12H21a3.39,3.39,0,0,0,3.27,2.44A3.35,3.35,0,0,0,27.54,12H31a1,1,0,1,0,0-1.9H27.54a3.38,3.38,0,0,0-6.5,0Zm4.71.95a1.48,1.48,0,1,1-1.48-1.49A1.51,1.51,0,0,1,25.75,11Z"
      />
      <path
        className={cs.cls7}
        d="M9.62,17.67H7a.95.95,0,0,0,0,1.9H9.62A3.4,3.4,0,0,0,12.89,22a3.37,3.37,0,0,0,3.24-2.44H31a.95.95,0,0,0,0-1.9H16.13a3.39,3.39,0,0,0-6.51,0Zm4.72.95a1.49,1.49,0,1,1-1.49-1.48A1.49,1.49,0,0,1,14.34,18.62Z"
      />
      <path
        className={cs.cls7}
        d="M16.47,26H7a.95.95,0,1,0,0,1.9h9.48a3.4,3.4,0,0,0,3.27,2.44A3.37,3.37,0,0,0,23,27.94h8A.95.95,0,0,0,31,26H23a3.39,3.39,0,0,0-6.51,0Zm4.72.95a1.49,1.49,0,1,1-3,0,1.49,1.49,0,0,1,3,0Z"
      />
    </svg>
  );
};

FiltersIcon.propTypes = {
  className: PropTypes.string
};

export default FiltersIcon;