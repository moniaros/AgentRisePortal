import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="breadcrumb" className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center">
          <Link to="/" className="hover:text-blue-500">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
          return (
            <li key={to} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-gray-700 dark:text-gray-200">{capitalizedValue}</span>
              ) : (
                <Link to={to} className="hover:text-blue-500">{capitalizedValue}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
