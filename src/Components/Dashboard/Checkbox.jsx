import React from 'react';
import styled from 'styled-components';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Checkbox = ({ checked, onChange }) => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <StyledWrapper isDarkMode={isDarkMode}>
      <div className="customCheckBoxHolder">
        <input
          type="checkbox"
          id="cCB1"
          className="customCheckBoxInput"
          checked={checked} // Controlled by the parent component
          onChange={onChange} // Trigger the parent's onChange handler
        />
        <label htmlFor="cCB1" className="customCheckBoxWrapper">
          <div className="customCheckBox">
            <div className="inner">Show Finalized</div>
          </div>
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .customCheckBoxHolder {
    margin: 5px;
    display: flex;
    transform: scale(0.85); /* Scale the checkbox to 75% of its original size */
    transform-origin: top left; /* Ensure scaling starts from the top-left corner */
  }

  .customCheckBox {
    width: fit-content;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    padding: 2px 8px;
    background-color: ${props => props.isDarkMode ? 'rgba(0, 0, 0, 0.16)' : 'rgba(0, 0, 0, 0.05)'};
    border-radius: 6px;
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
    transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
    transition-duration: 300ms;
    transition-property: color, background-color, box-shadow;
    display: flex;
    height: 32px;
    align-items: center;
    box-shadow: ${props => props.isDarkMode 
      ? 'rgba(0, 0, 0, 0.15) 0px 2px 1px 0px inset, rgba(255, 255, 255, 0.17) 0px 1px 1px 0px'
      : 'rgba(0, 0, 0, 0.05) 0px 2px 1px 0px inset, rgba(0, 0, 0, 0.07) 0px 1px 1px 0px'};
    outline: none;
    justify-content: center;
    min-width: 55px;
  }

  .customCheckBox:hover {
    background-color: ${props => props.isDarkMode ? '#2c2c2c' : '#f3f4f6'};
    color: ${props => props.isDarkMode ? 'white' : 'black'};
    box-shadow: ${props => props.isDarkMode
      ? 'rgba(0, 0, 0, 0.23) 0px -4px 1px 0px inset, rgba(255, 255, 255, 0.17) 0px -1px 1px 0px, rgba(0, 0, 0, 0.17) 0px 2px 4px 1px'
      : 'rgba(0, 0, 0, 0.1) 0px -4px 1px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 4px 1px'};
  }

  .customCheckBox .inner {
    font-size: 18px;
    font-weight: 900;
    pointer-events: none;
    transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
    transition-duration: 300ms;
    transition-property: transform;
    transform: translateY(0px);
  }

  .customCheckBox:hover .inner {
    transform: translateY(-2px);
  }

  .customCheckBoxInput {
    display: none;
  }

  .customCheckBoxInput:checked + .customCheckBoxWrapper .customCheckBox {
    background-color: #3b82f6; /* Same blue as the goals progress bar */
    color: white;
    box-shadow: rgba(0, 0, 0, 0.23) 0px -4px 1px 0px inset, rgba(255, 255, 255, 0.17) 0px -1px 1px 0px, rgba(0, 0, 0, 0.17) 0px 2px 4px 1px;
  }

  .customCheckBoxInput:checked + .customCheckBoxWrapper .customCheckBox:hover {
    background-color: #2563eb; /* Slightly darker blue on hover */
    box-shadow: rgba(0, 0, 0, 0.26) 0px -4px 1px 0px inset, rgba(255, 255, 255, 0.17) 0px -1px 1px 0px, rgba(0, 0, 0, 0.15) 0px 3px 6px 2px;
  }
`;

export default Checkbox;
