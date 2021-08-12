import { useState, useEffect } from 'react';
// import { makeStyles, createStyles } from '@material-ui/core/styles';
// import { Theme } from '@material-ui/core';
import ReactMarkdown from 'react-markdown';

// import {ReactComponent as TimeKeeperIcon} from '../assets/time-keeper-icon.svg';
// import readmeURL from '../assets/Readme.md';

// const useStyles = makeStyles((theme: Theme) => {
//   return createStyles({
//     infoContainer: {

//     }
//   })
// })

const getReadme = (() => {
  let readmeCache = '';

  return async () => {
    if (readmeCache) {
      return readmeCache;
    } else {
      try {
        // const readmeText = await fetch(readmeURL).then(response => response.text());
        const readmeText = await fetch('https://raw.githubusercontent.com/tertortoise/timekeeper_front_demo/master/README.md').then(response => response.text());
        readmeCache = readmeText;
        return readmeCache;
      } catch (e) {
        throw new Error('Failed to get info');
      }
    }
  }
})();

export default function AppInfo() {
  // const classes = useStyles();

  const [readme, setReadme] = useState('');

  useEffect(() => {
    if (!readme || readme === 'Failed to get info') {
      getReadme().then(readmeContents => setReadme(readmeContents)).catch(e => setReadme(e.message))
    }
    
  }, [readme])

  return (
    <div>
      Below is information from Readme.md file <a href="https://github.com/tertortoise/timekeeper_front_demo">in source repo</a>
      <ReactMarkdown disallowedElements={['a']}>{readme}</ReactMarkdown>
    </div>
  )
}