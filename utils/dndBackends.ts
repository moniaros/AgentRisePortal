import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

const isTouchDevice = () => {
  if ('ontouchstart' in window) {
    return true;
  }
  return false;
};

export const backendForDND = isTouchDevice() ? TouchBackend : HTML5Backend;