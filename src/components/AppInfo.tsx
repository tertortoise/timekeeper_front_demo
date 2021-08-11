import { useState, useEffect } from 'react';
// import { makeStyles, createStyles } from '@material-ui/core/styles';
// import { Theme } from '@material-ui/core';
import ReactMarkdown from 'react-markdown';

// import {ReactComponent as TimeKeeperIcon} from '../assets/time-keeper-icon.svg';
import readmeURL from '../assets/Readme.md';

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
        const readmeText = await fetch(readmeURL).then(response => response.text());
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

  console.log('[APPINFO][RENDER]', readme.slice(0, 10))



  return (
    <div>
      Below is information from Readme.md file in source repo
      <ReactMarkdown disallowedElements={['a']}>{readme}</ReactMarkdown>
    </div>
  )
}