import { StaticQuery, graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

import Header from 'starterComponents/Header';
import Footer from 'starterComponents/Footer';

const Layout = props => {
  const { children } = props;

  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
