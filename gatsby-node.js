const path = require('path');
const Promise = require('bluebird');

const { createFilePath } = require(`gatsby-source-filesystem`);

const SLUG_SEPARATOR = '___';

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const fileNode = getNode(node.parent);
    const filePath = createFilePath({ node, getNode });

    const source = fileNode.sourceInstanceName;

    const separtorIndex = ~filePath.indexOf(SLUG_SEPARATOR)
      ? filePath.indexOf(SLUG_SEPARATOR)
      : 0;
    const slugIndex = separtorIndex ? separtorIndex + SLUG_SEPARATOR.length : 0;

    const slug = `${separtorIndex ? '/' : ''}${filePath.substring(slugIndex)}`;
    const identifier = slug.replace(/\//g, '');
    const prefix = separtorIndex ? filePath.substring(1, separtorIndex) : '';

    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
    createNodeField({
      node,
      name: `identifier`,
      value: identifier,
    });
    createNodeField({
      node,
      name: `prefix`,
      value: prefix,
    });
    createNodeField({
      node,
      name: `source`,
      value: source,
    });
  }
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const pageTemplate = path.resolve('./src/templates/PageTemplate.js');

    resolve(
      graphql(`
        {
          allMarkdownRemark(
            filter: { fileAbsolutePath: { regex: "//pages//" } }
            sort: { fields: [fields___prefix], order: DESC }
            limit: 1000
          ) {
            edges {
              node {
                fileAbsolutePath
                fields {
                  slug
                  identifier
                  prefix
                }
                frontmatter {
                  title
                  categories
                }
              }
            }
          }
        }
      `).then(result => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
        }

        const items = result.data.allMarkdownRemark.edges;

        const categorySet = new Set();

        // Create category list
        items.forEach(edge => {
          const {
            node: {
              frontmatter: { categories },
            },
          } = edge;

          if (categories) {
            categories.forEach(category => {
              categorySet.add(category);
            });
          }
        });

        // create pages
        const pages = items.filter(item =>
          /pages/.test(item.node.fileAbsolutePath)
        );
        pages.forEach(({ node }) => {
          const slug = node.fields.slug;

          createPage({
            path: slug,
            component: pageTemplate,
            context: {
              slug,
            },
          });
        });
      })
    );
  });
};

exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
}) => {
  switch (stage) {
    case 'build-javascript':
      actions.setWebpackConfig({
        module: {
          rules: [
            {
              test: /\.yaml$/,
              include: path.resolve('data'),
              loader: 'yaml',
            },
          ],
        },
      });
  }
};
