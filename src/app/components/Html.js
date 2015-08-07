import React, {
  Component,
  PropTypes,
  renderToString,
} from 'react';

class Html extends Component {
  static propTypes = {
    component: PropTypes.element,
  }

  render() {
    const { component } = this.props;
    const title = 'React Base';
    return (
      <html lang="en">
      <head>
        <meta charSet="UTF-8"/>
        <title>{title}</title>
        {/* <link rel="stylesheet" href="/build/index.css"/> */}
      </head>
      <body>
        <div id="body" dangerouslySetInnerHTML={{ __html: renderToString(component) }}/>
        <script src="/build/index.js"/>
      </body>
      </html>
    );
  }
}

export default Html;