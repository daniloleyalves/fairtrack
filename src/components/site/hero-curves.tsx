import { DrawPath } from './draw-path';

export function HeroCurves() {
  return (
    <div className='hidden lg:block'>
      <DrawPath
        viewBox='0 0 85 151'
        className='absolute top-24 right-0 h-36'
        d='M184.5 30.5L85.948 7.79981C45.2974 -1.56353 6.5 29.3132 6.5 71.0282V71.0282C6.5 118.016 54.892 149.423 97.8068 130.288L200.5 84.5'
        stroke='#446622'
        strokeWidth={12}
        duration={1.6}
      />
      <DrawPath
        viewBox='0 0 120 270'
        className='absolute top-20 right-0 h-60'
        d='M216.113 38.3471L121.573 10.294C63.8989 -6.81963 6 36.3941 6 96.5535V96.5535C6 165.729 80.8082 209.03 140.793 174.575L235 120.463'
        stroke='#99BB44'
        strokeWidth={8}
        delay={0.25}
        duration={2}
      />
      <DrawPath
        viewBox='0 0 463 715'
        className='absolute top-[500px] -left-40 h-[350px]'
        d='M191.302 6L250.033 26.8248C364.536 67.4258 444.754 171.187 455.215 292.224V292.224C466.966 428.195 388.382 555.848 261.688 606.592L6 709'
        stroke='#446622'
        strokeWidth={14}
        duration={2}
      />
      <DrawPath
        viewBox='0 0 423 569'
        className='absolute top-[480px] -left-48 h-[400px]'
        d='M175.547 10L249.26 32.8475C338.176 60.4072 401.934 138.547 411.093 231.184V231.184C421.601 337.473 358.027 437.154 257.219 472.447L10 559'
        stroke='#99BB44'
        strokeWidth={20}
        delay={0.25}
        duration={2.4}
      />
    </div>
  );
}
