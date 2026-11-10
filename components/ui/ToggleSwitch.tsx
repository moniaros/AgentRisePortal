import React from 'react';

interface ToggleSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  id: string;
  value?: string | number | readonly string[] | boolean;
}

const ToggleSwitch = React.forwardRef<HTMLInputElement, ToggleSwitchProps>(({ id, value, ...props }, ref) => {
  const inputValue = typeof value === 'boolean' ? undefined : value;
  return (
    <label htmlFor={id} className="inline-flex relative items-center cursor-pointer">
      <input ref={ref} type="checkbox" id={id} value={inputValue} className="sr-only peer" {...props} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

export default ToggleSwitch;
