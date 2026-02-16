import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="layout-footer">
      <div className="layout-footer__inner">
        <span className="layout-footer__copy">© {year} School Admin. All rights reserved.</span>
        <div className="layout-footer__links">
          <a href="#help" className="layout-footer__link">Help</a>
          <span className="layout-footer__dot">·</span>
          <a href="#privacy" className="layout-footer__link">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
