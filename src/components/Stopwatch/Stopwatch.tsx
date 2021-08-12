import { useState, useEffect, useRef } from 'react';

import { getTimeDurationString } from '../../utils/timeDateUtils';

interface StopwatchProps {
  startTime?: number;
  showSecs?: boolean;
  renderShowElement?: (timeToShow: string) => JSX.Element;
}


const Stopwatch: React.FC<StopwatchProps> = (
  { startTime,
    showSecs = true,
    renderShowElement }
) => {

  const [timeElapsed, setTimeElapsed] = useState<number | undefined>();

  const timerId = useRef<NodeJS.Timeout | undefined>();

  const timeToShow = getTimeDurationString(timeElapsed, true)

  useEffect(() => {
    if (!startTime) {
      setTimeElapsed(undefined);
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      return;
    } else {
      setTimeElapsed(Date.now() - startTime);
      timerId.current &&  clearInterval(timerId.current);
      timerId.current = setInterval(() => {
        setTimeElapsed(Date.now() - startTime)
      }, 1000)
    }
  }, [startTime])


  return (
    renderShowElement ?
      renderShowElement(timeToShow) :
      (<div>{timeToShow}</div>)
  )
}

export default Stopwatch;