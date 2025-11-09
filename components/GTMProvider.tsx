import React, { useEffect } from 'react';

interface GTMProviderProps {
    children: React.ReactNode;
}

const GTMProvider: React.FC<GTMProviderProps> = ({ children }) => {
  useEffect(() => {
    const gtmId = localStorage.getItem('gtmContainerId');

    if (gtmId && !document.getElementById('gtm-script')) {
      // GTM head script
      const script = document.createElement('script');
      script.id = 'gtm-script';
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(script);

      // GTM body noscript
      const noScript = document.createElement('noscript');
      noScript.id = 'gtm-noscript';
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noScript.appendChild(iframe);
      document.body.insertBefore(noScript, document.body.firstChild);

      // Initialize dataLayer
      (window as any).dataLayer = (window as any).dataLayer || [];
    }
  }, []);

  return <>{children}</>;
};

export default GTMProvider;
